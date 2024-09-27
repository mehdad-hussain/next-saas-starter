"use client";

import type { DataTableFilterField } from "@/types";
import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
    type TableOptions,
    type TableState,
    type VisibilityState,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { z } from "zod";

import { useDebounce } from "@/hooks/use-debounce";
import { useQueryString } from "@/hooks/use-query-string";

interface UseDataTableProps<TData>
    extends Omit<TableOptions<TData>, "pageCount" | "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting">,
        Required<Pick<TableOptions<TData>, "pageCount">> {
    filterFields?: DataTableFilterField<TData>[];
    enableAdvancedFilter?: boolean;
    method?: "push" | "replace";
    scroll?: boolean;
    startTransition?: React.TransitionStartFunction;

    initialState?: Omit<Partial<TableState>, "sorting"> & {
        sorting?: {
            id: Extract<keyof TData, string>;
            desc: boolean;
        }[];
    };
}

const searchBlogsSchema = z.object({
    page: z.coerce.number().default(1),
    per_page: z.coerce.number().optional(),
    sort: z.string().optional(),
});

export function useDataTable<TData>({
    pageCount = -1,
    filterFields = [],
    method = "replace",
    scroll = false,
    startTransition,
    ...props
}: UseDataTableProps<TData>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Search params
    const search = searchBlogsSchema.parse(Object.fromEntries(searchParams));
    const page = search.page;
    const perPage = search.per_page ?? props.initialState?.pagination?.pageSize ?? 10;
    const sort = search.sort ?? `${props.initialState?.sorting?.[0]?.id}.${props.initialState?.sorting?.[0]?.desc ? "desc" : "asc"}`;
    const [column, order] = sort?.split(".") ?? [];

    // Memoize computation of searchableColumns and filterableColumns
    const { searchableColumns, filterableColumns } = React.useMemo(() => {
        return {
            searchableColumns: filterFields.filter((field) => !field.options),
            filterableColumns: filterFields.filter((field) => field.options),
        };
    }, [filterFields]);

    // Create query string
    const { createQueryString } = useQueryString(searchParams);

    // Initial column filters
    const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
        return Array.from(searchParams.entries()).reduce<ColumnFiltersState>((filters, [key, value]) => {
            const filterableColumn = filterableColumns.find((column) => column.value === key);
            const searchableColumn = searchableColumns.find((column) => column.value === key);

            if (filterableColumn) {
                filters.push({
                    id: key,
                    value: value.split("."),
                });
            } else if (searchableColumn) {
                filters.push({
                    id: key,
                    value: [value],
                });
            }

            return filters;
        }, []);
    }, [filterableColumns, searchableColumns, searchParams]);

    // Table states
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters);

    // Handle server-side pagination
    const [{ pageIndex, pageSize }, setPagination] = React.useState<PaginationState>({
        pageIndex: page - 1,
        pageSize: perPage,
    });

    const pagination = React.useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize],
    );

    // Handle server-side sorting
    const [sorting, setSorting] = React.useState<SortingState>([
        {
            id: column ?? "",
            desc: order === "desc",
        },
    ]);

    React.useEffect(() => {
        function onUrlChange() {
            const url = `${pathname}?${createQueryString({
                page: pageIndex + 1,
                per_page: pageSize,
                sort: sorting[0]?.id ? `${sorting[0]?.id}.${sorting[0]?.desc ? "desc" : "asc"}` : null,
            })}`;

            method === "push" ? router.push(url, { scroll }) : router.replace(url, { scroll });
        }

        startTransition
            ? startTransition(() => {
                  onUrlChange();
              })
            : onUrlChange();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageIndex, pageSize, sorting, method, scroll]);

    // Handle server-side filtering
    const debouncedSearchableColumnFilters = JSON.parse(
        useDebounce(
            JSON.stringify(
                columnFilters.filter((filter) => {
                    return searchableColumns.find((column) => column.value === filter.id);
                }),
            ),
            500,
        ),
    ) as ColumnFiltersState;

    const filterableColumnFilters = columnFilters.filter((filter) => {
        return filterableColumns.find((column) => column.value === filter.id);
    });

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        // Prevent resetting the page on initial render
        if (!mounted) {
            setMounted(true);
            return;
        }

        // Initialize new params
        const newParamsObject = {
            page: 1,
        };

        // Handle debounced searchable column filters
        for (const column of debouncedSearchableColumnFilters) {
            if (typeof column.value === "string") {
                Object.assign(newParamsObject, {
                    [column.id]: typeof column.value === "string" ? column.value : null,
                });
            }
        }

        // Handle filterable column filters
        for (const column of filterableColumnFilters) {
            if (typeof column.value === "object" && Array.isArray(column.value)) {
                Object.assign(newParamsObject, { [column.id]: column.value.join(".") });
            }
        }

        // Remove deleted values
        for (const key of searchParams.keys()) {
            if (
                (searchableColumns.find((column) => column.value === key) &&
                    !debouncedSearchableColumnFilters.find((column) => column.id === key)) ||
                (filterableColumns.find((column) => column.value === key) && !filterableColumnFilters.find((column) => column.id === key))
            ) {
                Object.assign(newParamsObject, { [key]: null });
            }
        }

        // After cumulating all the changes, push new params
        function onUrlChange() {
            const url = `${pathname}?${createQueryString(newParamsObject)}`;

            method === "push" ? router.push(url, { scroll }) : router.replace(url, { scroll });
        }

        startTransition
            ? startTransition(() => {
                  onUrlChange();
              })
            : onUrlChange();

        table.setPageIndex(0);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(debouncedSearchableColumnFilters),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(filterableColumnFilters),
        method,
        scroll,
    ]);

    const table = useReactTable({
        ...props,
        pageCount,
        state: {
            pagination,
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    return { table };
}
