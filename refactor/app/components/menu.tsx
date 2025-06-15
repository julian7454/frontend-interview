import { useEffect, useState } from "react";

// 假設mockFetch是一個3秒後回傳API結果的function

type List = {
  id: number;
  name: string;
};


export default function Menu() {
  const [menuList, setMenuList] = useState<List[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await mockFetch();
      setMenuList(data);
    }
    fetchData();
  }, []);

  return (
    <div className="px-4">
      {menuList.length ? menuList.map((item) => (
        <ul key={item.id}>
          <li className="list-disc">{item.name}</li>
        </ul>
      )) : 'Loading...'}
    </div>
  );
}

function mockFetch(): Promise<List[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "steak",
        },
        {
          id: 2,
          name: "chicken",
        },
      ]);
    }, 3000);
  });
}
