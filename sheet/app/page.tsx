"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import DataTable, {
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableFoot,
} from "@/components/data-table";
import { Skeleton } from "@/components/skeleton";
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
  setTableData: React.Dispatch<React.SetStateAction<AccountDataWithShowBalance[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  try {
    setLoading(true);
    setError(null);
    const pageStart = (page - 1) * pageSize;

    if (cache.has(page)) {
      console.log("cache hit for page", page);
      const pageData = Array.from(allData.values()).slice(pageStart, pageStart + pageSize);
      setTableData(pageData);
      setLoading(false);
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
      setLoading(false);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setError("Error fetching data");
    setLoading(false);
  }
};

export default function Home() {
  const [tableData, setTableData] = useState<Array<AccountDataWithShowBalance>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(totalItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 9;
  const pageStart = (page - 1) * pageSize;
  const maxPages = Math.max(1, Math.ceil(total / pageSize));

  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData(page, pageSize, setTableData, setLoading, setError);
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
    loadData(1, pageSize, setTableData, setLoading, setError);
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
    <div className="grid grid-rows-[64px_1fr_auto] min-h-screen">
      <header className="flex justify-end h-[64px] items-center">
        <div className="avatar avatar-online h-12 mr-8">
          <div className="rounded-full">
            <Image src={`https://i.pravatar.cc/300?img14`} alt="User avatar" width={48} height={48} />
          </div>
        </div>
      </header>
      <main className="pt-8 pb-8 px-4">
        <div className="bg-white shadow-md flex justify-end pt-4 pr-4 gap-4">
          <input
            className="border border-gray-300 rounded p-2 mb-4 w-38 h-11"
            type="text"
            placeholder="Search Invoice..."
            ref={searchInputRef}
            onChange={(e) => handleSearch(e.target.value.toLowerCase())}
          />
          <button className="w-38 h-11 bg-[#FD5558] text-white rounded-md cursor-pointer" onClick={handleDelete}>Delete</button>
          <button
            className="w-38 h-11 bg-[#9155FD] text-white rounded-md cursor-pointer"
            onClick={handleRefresh}
          >
            Refresh Invoice
          </button>
        </div>
        <DataTable caption={typeof error === "string" ? error : undefined}>
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
            {loading
              ? Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
              : visibleData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select account ${item.id}`}
                      checked={item.checked}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelect(item.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-[#9155FD]">{`#${item.id}`}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-left ml-6 flex gap-2 items-center">
                      <div className="avatar h-8.5">
                        <div className="rounded-full">
                          <Image src={`https://i.pravatar.cc/300?img${item.id}`} alt={`Avatar of ${item.name}`} width={34} height={34} />
                        </div>
                      </div>
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <a href={`mailto:${item.mail}`}>{item.mail}</a>
                      </div>
                    </div>
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
                        ? <span className="badge bg-[#d3f5d3] text-[#56CA00]">Paid</span>
                        : <span className="badge bg-[#FE7272] text-[#fff]">Unpaid</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center gap-5">
                      <button
                        onClick={() => {

                          allData.delete(item.id);
                          const pageData = Array.from(allData.values()).slice(pageStart, pageStart + pageSize);
                          setTableData(pageData);
                          setTotal((prevTotal) => prevTotal - 1);
                          if (tableData.length === 1 && page > 1) {
                            setPage((prevPage) => Math.max(prevPage - 1, 1));
                          }
                        }}
                        aria-label={`Delete account ${item.id}`}
                        className="mr-2 cursor-pointer"
                      >
                        <span className="material-icons opacity-50">delete</span>
                      </button>
                      <button
                        onClick={() => handleShowBalanceToggle(item)}
                        aria-label={`Toggle balance for account ${item.id}`}
                        className="cursor-pointer"
                      >
                        {item.showBalance ? <span className="material-icons">visibility</span> : <span className="material-icons opacity-50">visibility</span>}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFoot>
            <TableRow>
              <TableCell colSpan={7}>
                <p className="text-right">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="disabled:opacity-50 disabled:cursor-not-allowed mr-2 cursor-pointer"
                  >
                    <span className="material-icons text-sm!">arrow_back_ios</span>
                  </button>
                  <span>{`${start}-${end} of ${total}`}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, maxPages))}
                    disabled={page === maxPages}
                    className="disabled:opacity-50 disabled:cursor-not-allowed material-icons text-2xl ml-2 cursor-pointer"
                  >
                    <span className="material-icons text-sm!">arrow_forward_ios</span>
                  </button>

                </p>
              </TableCell>
            </TableRow>
          </TableFoot>
        </DataTable>
      </main>
      <footer>footer</footer>
    </div>
  );
}
