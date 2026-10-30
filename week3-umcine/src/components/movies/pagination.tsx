import { cn } from "../../utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
}

// TMDB는 500페이지까지만 조회할 수 있어요
const TMDB_MAX_PAGE = 500;
const VISIBLE_PAGE_COUNT = 5;

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const lastPage = Math.min(totalPages, TMDB_MAX_PAGE);

  if (lastPage <= 1) return null;

  // 현재 페이지가 가운데 오도록 5개 번호 범위를 계산해요
  const startPage = Math.max(
    1,
    Math.min(page - Math.floor(VISIBLE_PAGE_COUNT / 2), lastPage - VISIBLE_PAGE_COUNT + 1),
  );
  const endPage = Math.min(lastPage, startPage + VISIBLE_PAGE_COUNT - 1);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  );

  const buttonClassName =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-bold disabled:opacity-40";

  return (
    <nav aria-label="페이지 이동" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        className={cn(buttonClassName, "border-[#E3E6EB] bg-white text-[#17191E]")}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        이전
      </button>

      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          aria-current={pageNumber === page ? "page" : undefined}
          className={cn(
            buttonClassName,
            pageNumber === page
              ? "border-[#17191E] bg-[#17191E] text-white"
              : "border-[#E3E6EB] bg-white text-[#17191E]",
          )}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        className={cn(buttonClassName, "border-[#E3E6EB] bg-white text-[#17191E]")}
        disabled={page >= lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        다음
      </button>
    </nav>
  );
}
