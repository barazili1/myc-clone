export const fetchCrashOdd = async (): Promise<number | null> => {
  try {
    // Specifically targeting the path requested: pre/hipr/hipr
    const response = await fetch(`https://xil8-db9df-default-rtdb.firebaseio.com/pre/hipr/hipr.json?t=${Date.now()}`);
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    const odd = Number(data);
    return isNaN(odd) ? null : odd;
  } catch (error) {
    console.error("Error fetching crash odd from Firebase:", error);
    return null;
  }
};

export const fetchNotifications = async (): Promise<Record<string, any> | null> => {
  try {
    const response = await fetch(`https://xil8-db9df-default-rtdb.firebaseio.com/note.json?t=${Date.now()}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications from Firebase:", error);
    return null;
  }
};

export const fetchAppleGridData = async (): Promise<boolean[][] | null> => {
  try {
    const response = await fetch(`https://xil8-db9df-default-rtdb.firebaseio.com/m11.json?t=${Date.now()}`);
    if (!response.ok) return null;
    const data = await response.json();
    
    if (!data) return null;

    const grid: boolean[][] = Array(10).fill(null).map(() => Array(5).fill(false));

    for (let i = 1; i <= 50; i++) {
        const key = `m${i}`;
        const entry = data[key]; 
        
        if (entry) {
            const valStr = entry[key]; 
            if (valStr !== undefined) {
                const isGood = String(valStr) === "1";
                const idx = i - 1;
                const row = Math.floor(idx / 5);
                const col = idx % 5;
                
                if (row < 10 && col < 5) {
                    grid[row][col] = isGood;
                }
            }
        }
    }
    return grid;
  } catch (error) {
    console.error("Apple Grid Fetch Error:", error);
    return null;
  }
};

export const updateAppleGridData = async (): Promise<boolean> => {
  try {
    const newData: Record<string, any> = {};

    const setRowData = (start: number, end: number, badCount: number) => {
      const keys: string[] = [];
      for (let i = start; i <= end; i++) keys.push(`m${i}`);
      
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [keys[i], keys[j]] = [keys[j], keys[i]];
      }

      const badKeys = new Set(keys.slice(0, badCount));

      for (let i = start; i <= end; i++) {
        const key = `m${i}`;
        const val = badKeys.has(key) ? "0" : "1";
        newData[key] = { [key]: val };
      }
    };

    setRowData(1, 5, 1);
    setRowData(6, 10, 1);
    setRowData(11, 15, 1);
    setRowData(16, 20, 1);
    setRowData(21, 25, 2);
    setRowData(26, 30, 2);
    setRowData(31, 35, 2);
    setRowData(36, 40, 3);
    setRowData(41, 45, 3);
    setRowData(46, 50, 4);

    const response = await fetch("https://xil8-db9df-default-rtdb.firebaseio.com/m11.json", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
    });
    return response.ok;
  } catch (e) {
    console.error("Error updating Apple Grid Data:", e);
    return false;
  }
};

export const sendKeyRequest = async (username: string): Promise<string | null> => {
  try {
    const payload = {
      username,
      timestamp: Date.now(),
      status: 'pending',
      userAgent: navigator.userAgent
    };
    
    const response = await fetch("https://xil8-db9df-default-rtdb.firebaseio.com/adm.json", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.name;
  } catch (e) {
    console.error("Error requesting key:", e);
    return null;
  }
};

export const checkKeyRequestStatus = async (requestId: string): Promise<{ status: string; key?: string } | null> => {
  try {
    const response = await fetch(`https://xil8-db9df-default-rtdb.firebaseio.com/adm/${requestId}.json?t=${Date.now()}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data) return null;
    
    return {
      status: data.status,
      key: data.key 
    };
  } catch (e) {
    console.error("Error checking key request:", e);
    return null;
  }
};