"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import DataTable, {
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/data-table";
import { mockFetch, AccountData, totalItems } from "./api/mock";

type AccountDataWithShowBalance = AccountData & {
  showBalance: boolean;
  checked: boolean;
  visible: boolean;
};

const loadData = async (
  page: number,
  pageSize: number,
  setTableData: React.Dispatch<
    React.SetStateAction<AccountDataWithShowBalance[]>
  >
) => {
  try {
    const result: AccountDataWithShowBalance[] = (
      await mockFetch({ page, pageSize })
    ).map((item: AccountData) => ({
      ...item,
      showBalance: false,
      checked: false,
      visible: true,
    }));
    setTableData(result);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default function Home() {
  const [tableData, setTableData] = useState<Array<AccountDataWithShowBalance>>(
    []
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(totalItems);

  const pageSize = 9;
  const pageStart = (page - 1) * pageSize;
  const maxPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTotal(totalItems);
    loadData(page, pageSize, setTableData);
  }, [page, pageSize]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    const checkedCount = tableData.filter((item) => item.checked).length;
    selectAllRef.current.indeterminate = false;
    selectAllRef.current.checked = false;

    if (checkedCount === tableData.length) {
      selectAllRef.current.checked = true;
    } else if (checkedCount > 0) {
      selectAllRef.current.indeterminate = true;
    }
  }, [tableData]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const visibleData = tableData.filter((item) => item.visible);
  const currentPageCount = visibleData.length;

  const start = !currentPageCount ? 0 : pageStart + 1;
  const end = Math.min(pageStart + currentPageCount, total);
  const currentTotal = total - (tableData.length - currentPageCount);

  const handleDelete = useCallback(() => {
    let deletedCount = 0;
    setTableData((prevData) => {
      const newData = prevData.filter((item) => !item.checked);
      deletedCount = prevData.length - newData.length;

      const isEmpty = newData.filter((item) => item.visible).length === 0;

      if (isEmpty && page < maxPages) {
        setPage(page + 1);
      }
      if (isEmpty && page === maxPages) {
        setPage(1);
      }
      return newData;
    });
    setTotal((prevTotal) => prevTotal - deletedCount);
  }, [page, maxPages]);

  return (
    <>
      <input
        type="text"
        placeholder="Search Invoice..."
        ref={searchInputRef}
        onChange={(e) => {
          const searchTerm = e.target.value.toLowerCase();
          setTableData((prevData) =>
            prevData.map((item) => ({
              ...item,
              visible:
                item.name.toLowerCase().includes(searchTerm) ||
                item.mail.toLowerCase().includes(searchTerm) ||
                item.id.toString().includes(searchTerm),
            }))
          );
        }}
      />
      <button onClick={handleDelete}>Delete</button>
      <button
        onClick={async () => {
          // 重新請求 mockFetch 並刷新資料
          if (searchInputRef.current) searchInputRef.current.value = "";
          await loadData(page, pageSize, setTableData);
        }}
      >
        Refresh Invoice
      </button>
      <DataTable>
        <TableHead>
          <TableRow>
            <TableCell>
              <input
                type="checkbox"
                ref={selectAllRef}
                aria-label="Select all accounts"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const isChecked = e.target.checked;
                  setTableData((prevData) =>
                    prevData.map((item) => ({ ...item, checked: isChecked }))
                  );
                  console.log(`Select all accounts: ${isChecked}`);
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
          {visibleData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <input
                  type="checkbox"
                  aria-label={`Select account ${item.id}`}
                  checked={item.checked}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const isChecked = e.target.checked;
                    setTableData((prevData) =>
                      prevData.map((acc) =>
                        acc.id === item.id
                          ? { ...acc, checked: isChecked }
                          : acc
                      )
                    );
                    console.log(`Select account ${item.id}: ${isChecked}`);
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
                {item.showBalance
                  ? `$${Math.trunc(item.balance)}`
                  : item.hasPaid
                    ? "Paid"
                    : "NoPaid"}
              </TableCell>
              <TableCell>
                <button
                  onClick={() => {
                    setTableData((prevData) =>
                      prevData.map((acc) =>
                        acc.id === item.id
                          ? { ...acc, showBalance: !acc.showBalance }
                          : acc
                      )
                    );
                    console.log(`Toggle balance for account ${item.id}`);
                  }}
                  aria-label={`Toggle balance for account ${item.id}`}
                >
                  {item.showBalance ? "Hide Balance" : "Show Balance"}
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
        <span>{`${start}-${end} of ${currentTotal}`} </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, maxPages))}
          disabled={page === maxPages}
        >
          Next
        </button>
      </div>
    </>
  );
}
