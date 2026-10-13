"use client";
import { FolderOpen, FileText, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import type { EmployeeDocument } from "@/lib/types/document";
import type { DisplayState, Option } from "@/lib/design/types";
const size = (bytes: number) =>
  bytes >= 1048576
    ? (bytes / 1048576).toFixed(1) + " MB"
    : Math.ceil(bytes / 1024) + " KB";
const date = (value: string) =>
  new Date(value + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
export function DocumentsScreen({
  items,
  state,
  option = "selected",
  onRetry,
  error,
}: {
  items: EmployeeDocument[];
  state: DisplayState;
  option?: Option;
  onRetry: () => void;
  error?: string;
}) {
  const cards = () => (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((file) => (
        <Card key={file.id} className="shadow-none">
          <CardContent className="space-y-4 px-6">
            <div className="flex items-center justify-between">
              <FileText className="size-5 text-primary" aria-hidden="true" />
              <Badge variant="secondary">{file.type}</Badge>
            </div>
            <h2 className="break-words font-semibold">{file.name}</h2>
            <p className="text-sm text-muted-foreground">
              {file.category} · {size(file.sizeBytes)}
            </p>
            <p className="text-sm text-muted-foreground">
              Updated {date(file.updatedAt)}
            </p>
            <Button
              disabled
              variant="outline"
              aria-label={"Preview " + file.name}
            >
              Preview only
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  return (
    <section aria-labelledby="documents-heading">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
          Employee files
        </p>
        <h1
          id="documents-heading"
          className="text-3xl font-semibold tracking-tight"
        >
          My Documents
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Review your fictional HR file metadata. File viewing and downloads are
          not connected.
        </p>
      </div>
      {state === "loading" ? (
        <Card>
          <CardContent
            className="space-y-4 px-6"
            role="status"
            aria-label="Loading documents"
          >
            <Skeleton className="h-6 w-48" />
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
            <p className="text-sm text-muted-foreground">
              Loading your documents…
            </p>
          </CardContent>
        </Card>
      ) : state === "error" ? (
        <Card>
          <CardContent role="alert" className="space-y-4 px-6 py-8">
            <TriangleAlert
              aria-hidden="true"
              className="size-6 text-destructive"
            />
            <h2 className="text-lg font-semibold">
              Unable to load your documents
            </h2>
            <p className="text-sm text-muted-foreground">
              {error ||
                "The document service is unavailable. Please try again."}
            </p>
            <Button onClick={onRetry}>Try again</Button>
          </CardContent>
        </Card>
      ) : state === "empty" ? (
        <Card>
          <CardContent role="status" className="space-y-4 px-6 py-8">
            <FolderOpen
              aria-hidden="true"
              className="size-6 text-muted-foreground"
            />
            <h2 className="text-lg font-semibold">No documents yet</h2>
            <p className="text-sm text-muted-foreground">
              When HR adds documents for you, they will appear here. Check again
              later or contact HR if you expect a file.
            </p>
            <Button variant="outline" onClick={onRetry}>
              Check again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {items.length} files · Most recently updated first
            </p>
            <Badge variant="outline">Fictional metadata</Badge>
          </div>
          {option === "alternative" ? (
            cards()
          ) : (
            <>
              <div className="hidden md:block">
                <Card>
                  <CardContent className="px-6">
                    <Table>
                      <TableCaption>
                        Preview only. File viewing and downloads are not
                        connected.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          {[
                            "File name",
                            "Category",
                            "Type",
                            "Size",
                            "Updated",
                            "Preview",
                          ].map((label) => (
                            <TableHead key={label}>{label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((file) => (
                          <TableRow key={file.id}>
                            <TableCell>
                              <span className="flex items-center gap-3 font-medium">
                                <FileText
                                  className="size-4 shrink-0 text-primary"
                                  aria-hidden="true"
                                />
                                {file.name}
                              </span>
                            </TableCell>
                            <TableCell>{file.category}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{file.type}</Badge>
                            </TableCell>
                            <TableCell className="tabular-nums">
                              {size(file.sizeBytes)}
                            </TableCell>
                            <TableCell>{date(file.updatedAt)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                disabled
                                aria-label={"Preview " + file.name}
                              >
                                Preview only
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
              <div className="md:hidden">{cards()}</div>
            </>
          )}
        </>
      )}
    </section>
  );
}
