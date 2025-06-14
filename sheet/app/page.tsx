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

const cache = new Set<number>();
const allData = new Map<number, AccountDataWithShowBalance>();

const loadData = async (
  page: number,
  pageSize: number,
  setTableData: React.Dispatch<React.SetStateAction<AccountDataWithShowBalance[]>>
) => {
  try {
    const pageStart = (page - 1) * pageSize;

    if (cache.has(page)) {
      console.log("cache hit for page", page);
      const pageData = Array.from(allData.values()).slice(pageStart, pageStart + pageSize);
      setTableData(pageData);
    } else {
      console.log("fetching data for page", page);
      const result: AccountDataWithShowBalance[] = (
        await mockFetch({ page, pageSize: pageSize * 2 })
      ).map((item: AccountData) => ({
        ...item,
        showBalance: false,
        checked: false,
        visible: true,
      }));

      result.forEach(item => allData.set(item.id, item));
      cache.add(page);
      const pageData = Array.from(allData.values()).slice(pageStart, pageStart + pageSize);

      setTableData(pageData.length ? pageData : result.slice(0, pageSize));
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default function Home() {
  const [tableData, setTableData] = useState<Array<AccountDataWithShowBalance>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(totalItems);

  const pageSize = 9;
  const pageStart = (page - 1) * pageSize;
  const maxPages = Math.max(1, Math.ceil(total / pageSize));

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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

  const start = !currentPageCount
    ? 0
    : allData.size < pageSize ? 1 : pageStart + 1;
  const end = !currentPageCount
    ? 0
    : Math.min(pageStart + currentPageCount, allData.size);

  const handleDelete = useCallback(() => {
    let deletedCount = 0;

    tableData.forEach(item => {
      if (item.checked) {
        allData.delete(item.id);
        deletedCount++;
      }
    });

    const pageData = Array.from(allData.values()).slice(pageStart, pageStart + pageSize);

    setTableData(pageData);
    setTotal((prevTotal) => prevTotal - deletedCount);

    if (pageData.length === 0) {
      setPage(page > 1 ? page - 1 : page + 1);
    }

  }, [page, pageStart, tableData]);

  const handleSelectAll = useCallback((isChecked: boolean) => {
    const updated = tableData.map(item => ({
      ...item,
      checked: isChecked,
    }));
    updated.forEach(item => allData.set(item.id, item));
    setTableData(updated);
  }, [tableData]);

  const handleSearch = useCallback((searchTerm: string) => {
    const filtered = Array.from(allData.values()).map((item) => ({
      ...item,
      visible:
        item.name.toLowerCase().includes(searchTerm) ||
        item.mail.toLowerCase().includes(searchTerm) ||
        item.id.toString().includes(searchTerm),
    }));

    filtered.forEach(item => allData.set(item.id, item));
    const pageData = filtered
      .filter(item => item.visible)
      .slice(pageStart, pageStart + pageSize);
    setTableData(pageData);
    setTotal(Array.from(allData.values()).filter(item => item.visible).length);
  }, [pageStart]);

  const handleRefresh = useCallback(() => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    cache.clear();
    allData.clear();
    setPage(1);
    setTotal(totalItems);
    loadData(1, pageSize, setTableData);
  }, []);

  const handleShowBalanceToggle = (item: AccountDataWithShowBalance) => {
    setTableData(prevData =>
      prevData.map(it =>
        it.id === item.id
          ? { ...it, showBalance: !it.showBalance }
          : it
      )
    );
    allData.set(item.id, { ...item, showBalance: !item.showBalance });
  };

  const handleSelect = (id: number, isChecked: boolean) => {
    setTableData(prevData =>
      prevData.map(it =>
        it.id === id
          ? { ...it, checked: isChecked }
          : it
      )
    );
    allData.set(id, { ...allData.get(id)!, checked: isChecked });
  }

  return (
    <>
      <input
        type="text"
        placeholder="Search Invoice..."
        ref={searchInputRef}
        onChange={(e) => handleSearch(e.target.value.toLowerCase())}
      />
      <button onClick={handleDelete}>Delete</button>
      <button
        onClick={handleRefresh}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectAll(e.target.checked)}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelect(item.id, e.target.checked)}
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
                  onClick={() => handleShowBalanceToggle(item)}
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
        <span>{`${start}-${end} of ${total}`}</span>
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

