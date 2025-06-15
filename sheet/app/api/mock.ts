export type AccountData = {
  id: number;
  name: string;
  mail: string;
  totalBalance: number;
  issueDate: number;
  balance: number;
  hasPaid: boolean;
};

export function mockFetch({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<AccountData[]> {
  const random = Math.random();
  if (random >= 0.3) {
    return onSuccess({ page, pageSize });
  } else {
    return onError();
  }
}

function onSuccess({ page, pageSize }: { page: number; pageSize: number }): Promise<AccountData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData.slice((page - 1) * pageSize, page * pageSize));
    }, 2500);
  });
}
function onError(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Failed to fetch data"));
    }, 5000);
  });
}

const mockData: AccountData[] = [
  {
    id: 1,
    name: "Alice Chen",
    mail: "alice.chen@example.com",
    totalBalance: 10230.75,
    issueDate: 1714003200000, // 2024-04-25
    balance: 230.75,
    hasPaid: false,
  },
  {
    id: 2,
    name: "Brian Lee",
    mail: "brian.lee@example.com",
    totalBalance: 15480.0,
    issueDate: 1711411200000, // 2024-03-26
    balance: 480.0,
    hasPaid: true,
  },
  {
    id: 3,
    name: "Cathy Wu",
    mail: "cathy.wu@example.com",
    totalBalance: 9200.5,
    issueDate: 1706745600000, // 2024-02-01
    balance: 1200.5,
    hasPaid: true,
  },
  {
    id: 4,
    name: "David Ho",
    mail: "david.ho@example.com",
    totalBalance: 18900.0,
    issueDate: 1704067200000, // 2024-01-01
    balance: 1900.0,
    hasPaid: true,
  },
  {
    id: 5,
    name: "Eva Lin",
    mail: "eva.lin@example.com",
    totalBalance: 6600.35,
    issueDate: 1716768000000, // 2024-05-27
    balance: 600.35,
    hasPaid: false,
  },
  {
    id: 6,
    name: "Frank Tsai",
    mail: "frank.tsai@example.com",
    totalBalance: 13200.0,
    issueDate: 1710374400000, // 2024-03-14
    balance: 200.0,
    hasPaid: false,
  },
  {
    id: 7,
    name: "Grace Hsu",
    mail: "grace.hsu@example.com",
    totalBalance: 8750.75,
    issueDate: 1698796800000, // 2023-11-01
    balance: 750.75,
    hasPaid: true,
  },
  {
    id: 8,
    name: "Henry Yang",
    mail: "henry.yang@example.com",
    totalBalance: 10050.0,
    issueDate: 1709251200000, // 2024-02-29
    balance: 50.0,
    hasPaid: true,
  },
  {
    id: 9,
    name: "Ivy Chang",
    mail: "ivy.chang@example.com",
    totalBalance: 14560.6,
    issueDate: 1701388800000, // 2023-12-01
    balance: 1560.6,
    hasPaid: false,
  },
  {
    id: 10,
    name: "Jack Wang",
    mail: "jack.wang@example.com",
    totalBalance: 3900.2,
    issueDate: 1719878400000, // 2024-08-02
    balance: 900.2,
    hasPaid: false,
  },
  {
    id: 11,
    name: "Karen Liu",
    mail: "karen.liu@example.com",
    totalBalance: 12700.0,
    issueDate: 1712294400000, // 2024-04-05
    balance: 700.0,
    hasPaid: false,
  },
  {
    id: 12,
    name: "Leo Chou",
    mail: "leo.chou@example.com",
    totalBalance: 7600.9,
    issueDate: 1722470400000, // 2024-08-31
    balance: 600.9,
    hasPaid: false,
  },
  {
    id: 13,
    name: "Mia Kuo",
    mail: "mia.kuo@example.com",
    totalBalance: 11110.11,
    issueDate: 1720915200000, // 2024-08-13
    balance: 110.11,
    hasPaid: true,
  },
] as const;

export const totalItems = mockData.length;