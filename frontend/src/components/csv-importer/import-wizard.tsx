"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CsvDropzone } from "./csv-dropzone";
import { LazyCsvPreviewTable } from "./csv-preview-table.lazy";
import { ImportOptionsForm, ImportOptionsValues } from "./import-options-form";
import { ImportProgress, ImportPhase } from "./import-progress";
import { ImportStepper, ImportStep } from "./import-stepper";
import { ImportSummaryCards } from "./import-summary-cards";
import { LazyImportResultsTabs } from "@/components/crm/import-results-tabs.lazy";
import { ErrorState } from "@/components/shared/error-state";
import { useCsvParser } from "@/hooks/use-csv-parser";
import { useImportMeta } from "@/hooks/use-import-meta";
import {
  ApiRequestError,
  confirmImportRequest,
  fetchImportDetail,
} from "@/lib/api-client";
import { DataSource, ImportDetail, RunImportResult } from "@/types/crm";
import Link from "next/link";

export function ImportWizard() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<ImportOptionsValues>({});
  const [importPhase, setImportPhase] = useState<ImportPhase>("uploading");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<RunImportResult | null>(null);
  const [detail, setDetail] = useState<ImportDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const parser = useCsvParser();
  const meta = useImportMeta();
  const stepHeadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parser.result && step === "upload") {
      setStep("preview");
    }
  }, [parser.result, step]);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  const handleFileSelected = (selected: File) => {
    setFile(selected);
    void parser.parse(selected);
  };

  const handleClearFile = () => {
    setFile(null);
    parser.reset();
  };

  const handleBackToUpload = () => {
    setStep("upload");
    handleClearFile();
  };

  const handleConfirmImport = async () => {
    if (!file) return;

    setStep("importing");
    setImportPhase("uploading");
    setUploadProgress(0);

    try {
      const runResult = await confirmImportRequest(file, {
        defaultDataSource: options.defaultDataSource as DataSource | undefined,
        defaultLeadOwner: options.defaultLeadOwner,
        onUploadProgress: (percent) => {
          setUploadProgress(percent);
          if (percent >= 100) setImportPhase("mapping");
        },
      });

      setResult(runResult);
      setStep("result");
      toast.success("Import completed", {
        description: `${runResult.importedCount} lead${runResult.importedCount === 1 ? "" : "s"} imported, ${runResult.skippedCount} skipped.`,
      });

      try {
        const importDetail = await fetchImportDetail(runResult.importId);
        setDetail(importDetail);
      } catch (err) {
        setDetailError(
          err instanceof ApiRequestError ? err.message : "Failed to load detailed results."
        );
      }
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Import failed. Please try again.";
      toast.error("Import failed", { description: message });
      setStep("preview");
    }
  };

  const handleReset = () => {
    setFile(null);
    parser.reset();
    setOptions({});
    setResult(null);
    setDetail(null);
    setDetailError(null);
    setStep("upload");
  };

  return (
    <div className="space-y-8">
      <Card className="py-5">
        <CardContent className="px-5">
          <ImportStepper current={step} />
        </CardContent>
      </Card>

      <div ref={stepHeadingRef} tabIndex={-1} className="outline-none">
      {step === "upload" && (
        <div className="animate-in-fast">
        <CsvDropzone
          file={file}
          isParsing={parser.isParsing}
          error={parser.error}
          onFileSelected={handleFileSelected}
          onClear={handleClearFile}
        />
        </div>
      )}

      {step === "preview" && parser.result && (
        <div className="animate-in-fast space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Preview — {parser.result.rows.length.toLocaleString()} rows detected
              </h2>
              <p className="text-sm text-muted-foreground">
                Review the raw data below. No AI processing has happened yet.
              </p>
            </div>
          </div>

          <LazyCsvPreviewTable headers={parser.result.headers} rows={parser.result.rows} />

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Import options (optional)</h3>
            <ImportOptionsForm
              dataSources={meta.dataSources}
              defaultValues={options}
              onChange={setOptions}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={handleBackToUpload} className="w-full justify-center sm:w-auto">
              <ArrowLeft className="size-4" />
              Choose a different file
            </Button>
            <Button onClick={handleConfirmImport} className="w-full justify-center sm:w-auto">
              Confirm &amp; Import with AI
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "importing" && parser.result && (
        <div className="animate-in-fast">
        <ImportProgress
          phase={importPhase}
          uploadProgress={uploadProgress}
          totalRows={parser.result.rows.length}
        />
        </div>
      )}

      {step === "result" && result && (
        <div className="animate-in-fast space-y-6">
          <ImportSummaryCards
            totalRows={result.totalRows}
            importedCount={result.importedCount}
            skippedCount={result.skippedCount}
          />

          {detailError && <ErrorState description={detailError} />}
          {detail && <LazyImportResultsTabs leads={detail.leads} skipped={detail.skipped} />}
          {!detail && !detailError && (
            <div className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              Loading detailed results…
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              render={<Link href="/history" />}
              className="w-full justify-center sm:w-auto"
            >
              View full import history
            </Button>
            <Button onClick={handleReset} className="w-full justify-center sm:w-auto">
              <RotateCcw className="size-4" />
              Import another file
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
