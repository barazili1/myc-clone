
import { AccessKey } from '../types';

const DB_URL = "https://xil8-db9df-default-rtdb.firebaseio.com/keys.json";

export const verifyAccessKey = async (inputKey: string): Promise<{ valid: boolean; data?: AccessKey; error?: string }> => {
  try {
    // 1. Check for Local Temporary Key first (generated in GetCode screen)
    const tempKeyString = localStorage.getItem('temp_access_key');
    if (tempKeyString) {
        try {
            const tempKeyData = JSON.parse(tempKeyString);
            if (inputKey === tempKeyData.key) {
                if (Date.now() < tempKeyData.expiresAt) {
                     return { 
                         valid: true, 
                         data: {
                             key: inputKey,
                             isActive: true,
                             type: 'TEMPORARY',
                             name: 'Guest User',
                             createdAt: Date.now(),
                             expiresAt: tempKeyData.expiresAt
                         }
                     };
                } else {
                    // Expired - Key remains in storage to enforce "One Key" policy in UI
                    return { valid: false, error: "Temporary key has expired." };
                }
            }
        } catch (e) {
            console.warn("Error parsing temp key", e);
        }
    }

    // 2. Regular Remote DB Check
    // Add cache busting timestamp
    const response = await fetch(`${DB_URL}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error("Network error connecting to verification server.");
    }

    const data = await response.json();
    
    if (!data) {
        return { valid: false, error: "Database empty or inaccessible." };
    }

    // Iterate through keys in the database object to find a match
    const match = Object.values(data).find((entry: any) => entry.key === inputKey) as AccessKey | undefined;

    if (!match) {
        return { valid: false, error: "Invalid Access Key." };
    }

    if (!match.isActive) {
        return { valid: false, error: "Key has been disabled." };
    }

    // Simulate Expiration if not present (Default 30 days from creation)
    if (match.type !== 'PERMANENT' && !match.expiresAt) {
        const creation = match.createdAt || Date.now();
        // 30 days in ms
        match.expiresAt = creation + (30 * 24 * 60 * 60 * 1000);
    }

    return { valid: true, data: match };

  } catch (error) {
    console.error("Auth Error:", error);
    return { valid: false, error: "Connection failed. Please check internet." };
  }
};
