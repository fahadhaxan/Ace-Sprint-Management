import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Download,
  ArrowRight
} from 'lucide-react';
import { parseExcelFile, ParsedWorkbookResult, downloadSampleWorkbook } from '../utils/excel';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (result: ParsedWorkbookResult, targetOverride: 'auto' | 'tickets' | 'requests') => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParsedWorkbookResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [targetMode, setTargetMode] = useState<'auto' | 'tickets' | 'requests'>('auto');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setIsParsing(true);
    try {
      const result = await parseExcelFile(file);
      setParseResult(result);
    } catch (err) {
      console.error('Failed to parse Excel file', err);
      setErrorMsg('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls workbook.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleImportSubmit = () => {
    if (!parseResult) return;
    onConfirmImport(parseResult, targetMode);
    onClose();
    // reset state
    setSelectedFile(null);
    setParseResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Import Excel Workbooks
              </h2>
              <p className="text-xs text-slate-500">
                Bulk-populate Request Register and Sprint Tracker. Duplicates are auto-merged by ID.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          
          {/* File Upload Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-red-500 bg-red-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-red-400 hover:bg-slate-50'
            }`}
          >
            <div className="max-w-sm mx-auto space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-red-600 mx-auto" />
              <div className="text-sm font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Select or drop an Excel workbook here'}
              </div>
              <p className="text-xs text-slate-500">
                Supports .xlsx or .xls workbooks. Click to browse files.
              </p>
            </div>
          </div>

          {/* Sample Template Links */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Need sample format templates?</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => downloadSampleWorkbook('tickets')}
                className="text-red-700 hover:text-red-900 font-semibold underline cursor-pointer"
              >
                Sprint Tracker Template
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => downloadSampleWorkbook('requests')}
                className="text-red-700 hover:text-red-900 font-semibold underline cursor-pointer"
              >
                Request Register Template
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsing Status */}
          {isParsing && (
            <div className="py-4 text-center text-xs text-slate-500 font-medium">
              Reading workbook sheets and auto-mapping columns...
            </div>
          )}

          {/* Parsed Results Summary */}
          {parseResult && !isParsing && (
            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Workbook Parsed Successfully!</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Sheets Found</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{parseResult.sheetNames.length}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Sprint Tickets</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{parseResult.tickets.length}</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Requests</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{parseResult.requests.length}</div>
                </div>
              </div>

              {/* Target Import Options */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Import Destination & Auto-Mapping
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetMode('auto')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left cursor-pointer ${
                      targetMode === 'auto'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>Auto Detect</div>
                    <div className="text-[10px] opacity-80">Distribute by sheet name</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMode('tickets')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left cursor-pointer ${
                      targetMode === 'tickets'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>Sprint Tracker Only</div>
                    <div className="text-[10px] opacity-80">Treat all rows as tickets</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMode('requests')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left cursor-pointer ${
                      targetMode === 'requests'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>Request Register Only</div>
                    <div className="text-[10px] opacity-80">Treat rows as requests</div>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                * Note: Any rows with existing IDs will update the current record, and new IDs will be added to the register.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parseResult || parseResult.totalRowsParsed === 0}
            onClick={handleImportSubmit}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              parseResult && parseResult.totalRowsParsed > 0
                ? 'bg-red-700 hover:bg-red-800 text-white shadow-2xs'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Confirm & Merge Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
