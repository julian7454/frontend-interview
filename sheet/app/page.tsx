"use client";
import { useState, useEffect } from "react";
import DataTable, {
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/data-table";
import { mockFetch, AccountData } from "./api/mock";

type DataItem = {
  id: number;
  name: string;
  mail: string;
  totalBalance: number;
  issueDate: number;
  balance: number;
  hasPaid: boolean;
};

function paginateData<T>(
  data: Array<T>,
  page: number,
  pageSize: number,
) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);
  const maxPages = Math.ceil(data.length / pageSize);
  return { pageData, maxPages };
}

export default function Home() {
  const [showBalance, setShowBalance] = useState(false);
  const [tableData, setTableData] = useState<Array<AccountData>>([]);
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const pageStart = (page - 1) * pageSize;

  const { maxPages } = paginateData(
    tableData,
    page,
    pageSize,
  );

  useEffect(() => {
    const loadData = async () => {
      const result = await mockFetch({ page, pageSize });
      console.log(result);
      setTableData(result);
    };
    loadData();
  }, [page, pageSize]);

  return (
    <>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableCell>
              <input
                type="checkbox"
                aria-label="Select all accounts"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  console.log("Select all:", e.target.checked);
                }}
              />
            </TableCell>
            <TableCell>ID</TableCell>
            <TableCell>CLIENT</TableCell>
            <TableCell>TOTAL</TableCell>
            <TableCell>ISSUE DATE</TableCell>
            <TableCell>BALANCE</TableCell>
            <TableCell>ACTIONS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((item: DataItem) => (
            <TableRow key={item.id}>
              <TableCell>
                <input
                  type="checkbox"
                  aria-label={`Select account ${item.id}`}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    console.log(`Select account ${item.id}:`, e.target.checked);
                  }}
                />
              </TableCell>
              <TableCell>{`#${item.id}`}</TableCell>
              <TableCell>
                <strong>{item.name}</strong>
                <br />
                {item.mail}
              </TableCell>
              <TableCell>{`$${Math.trunc(item.totalBalance)}`}</TableCell>
              <TableCell>
                {new Date(item.issueDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                {showBalance
                  ? `$${Math.trunc(item.balance)}`
                  : item.hasPaid
                    ? "Paid"
                    : "NoPaid"}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => {
                    setShowBalance(!showBalance);
                    console.log(`Toggle balance for account ${item.id}`);
                  }}
                  aria-label={`Toggle balance for account ${item.id}`}
                >
                  {showBalance ? "Hide Balance" : "Show Balance"}
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
      <div>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>{`${pageStart + 1}-${Math.min(pageStart + pageSize, tableData.length)} of ${tableData.length}`}</span>
        <button
          onClick={() =>
            setPage((p) => Math.min(p + 1, maxPages))
          }
          disabled={page === maxPages}
        >
          Next
        </button>
      </div>
    </>
  );
}