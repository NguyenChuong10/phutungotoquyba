'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ToastNotification, { ToastMessage } from '@/components/ui/ToastNotification';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { AdminApiService } from '@/services/adminApiService';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Power,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Package,
  Activity,
  Code2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface OdooDetails {
  apiKey: string;
  isCustomKey: boolean;
  syncEnabled: boolean;
  lastSyncedAt: string | null;
  lastSyncCount: number | null;
  lastSyncStatus: string | null;
  lastSyncMessage: string | null;
  baseUrl: string;
  endpoints: {
    syncBySku: string;
    linkProduct: string;
    batchUnlink: string;
    verifyAuth: string;
  };
}

export default function AdminOdooPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OdooDetails | null>(null);
  const [toastState, setToastState] = useState<ToastMessage | null>(null);

  // Form input state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [syncEnabledState, setSyncEnabledState] = useState(true);
  const [togglingSync, setTogglingSync] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Copy state
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal confirm regenerate
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Test connection state
  const [testingConnection, setTestingConnection] = useState(false);

  // Code sample tab
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'curl' | 'hmac'>('python');

  const fetchOdooSettings = async () => {
    setLoading(true);
    try {
      const res = await AdminApiService.getOdooSettings();
      if (res.ok && res.data) {
        setData(res.data);
        setApiKeyInput(res.data.apiKey);
        setSyncEnabledState(res.data.syncEnabled);
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Lỗi Tải Dữ Liệu',
          message: res.error || 'Không thể tải cấu hình kết nối Odoo ERP',
        });
      }
    } catch (err: any) {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: err.message || 'Không thể kết nối đến máy chủ backend',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOdooSettings();
  }, []);

  const handleCopy = (text: string, type: 'key' | 'url' | 'code', keyIdentifier?: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === 'url') {
      setCopiedUrl(keyIdentifier || 'url');
      setTimeout(() => setCopiedUrl(null), 2000);
    } else if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
    setToastState({
      id: String(Date.now()),
      type: 'success',
      title: 'Đã Sao Chép',
      message: text.length > 50 ? `${text.slice(0, 50)}...` : text,
    });
  };

  const handleToggleSync = async () => {
    const nextState = !syncEnabledState;
    setTogglingSync(true);
    setSyncEnabledState(nextState);
    try {
      const res = await AdminApiService.updateOdooSettings({
        syncEnabled: nextState,
      });

      if (res.ok && res.data) {
        setSyncEnabledState(res.data.syncEnabled);
        setData((prev) => (prev ? { ...prev, syncEnabled: res.data.syncEnabled } : null));
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: nextState ? 'Đã Bật Đồng Bộ Odoo' : 'Đã Tắt Đồng Bộ Odoo',
          message: nextState
            ? 'Hệ thống đã sẵn sàng tiếp nhận các lượt đồng bộ từ Odoo ERP.'
            : 'Đã tạm ngắt và chặn toàn bộ các yêu cầu đồng bộ từ Odoo ERP (HTTP 403).',
        });
      } else {
        setSyncEnabledState(!nextState);
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Cập Nhật Thất Bại',
          message: res.message || 'Không thể lưu trạng thái lên máy chủ.',
        });
      }
    } catch (err: any) {
      setSyncEnabledState(!nextState);
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: err.message,
      });
    } finally {
      setTogglingSync(false);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!apiKeyInput.trim()) {
      setToastState({
        id: String(Date.now()),
        type: 'warning',
        title: 'Khóa Không Hợp Lệ',
        message: 'Vui lòng không để trống API Key',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await AdminApiService.updateOdooSettings({
        apiKey: apiKeyInput.trim(),
        syncEnabled: syncEnabledState,
      });

      if (res.ok && res.data) {
        setData(res.data);
        setApiKeyInput(res.data.apiKey);
        setSyncEnabledState(res.data.syncEnabled);
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Lưu Cấu Hình Thành Công',
          message: 'Đã cập nhật khóa xác thực và trạng thái đồng bộ Odoo ERP!',
        });
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Lưu Thất Bại',
          message: res.message || 'Lỗi lưu cài đặt Odoo ERP',
        });
      }
    } catch (err: any) {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    try {
      const res = await AdminApiService.regenerateOdooApiKey();
      if (res.ok && res.data?.apiKey) {
        const newKey = res.data.apiKey;
        setApiKeyInput(newKey);
        setData((prev) => (prev ? { ...prev, apiKey: newKey, isCustomKey: true } : null));
        setIsRegenerateModalOpen(false);
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Đã Tạo Khóa Mới Thành Công',
          message: 'Vui lòng cập nhật API Key mới vào cấu hình Webhook bên Odoo ERP.',
        });
      }
    } catch (err: any) {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Không Thể Tạo Khóa',
        message: err.message,
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await AdminApiService.testOdooConnection();
      if (res.ok && res.data) {
        setToastState({
          id: String(Date.now()),
          type: 'success',
          title: 'Xác Thực Hoạt Động Tốt',
          message: 'Cơ chế xác thực API Key và chữ ký HMAC-SHA256 sẵn sàng nhận kết nối!',
        });
      } else {
        setToastState({
          id: String(Date.now()),
          type: 'error',
          title: 'Kiểm Tra Thất Bại',
          message: res.message || 'Không thể kiểm tra xác thực.',
        });
      }
    } catch (err: any) {
      setToastState({
        id: String(Date.now()),
        type: 'error',
        title: 'Lỗi Kết Nối',
        message: err.message,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const syncEndpointUrl = data?.endpoints?.syncBySku || 'https://phutungotoquyba.buiduchieu.id.vn/api/v1/products/sync-by-sku';

  const pythonSnippet = `# Code mẫu Odoo Server Action / Scheduled Action
import requests

SYNC_URL = "${syncEndpointUrl}"
API_KEY = "${apiKeyInput || 'qba_live_your_secret_key'}"

payload = {
    "items": [
        {"odooId": 101, "sku": "HOWO-WG9725540001"},
        {"odooId": 102, "sku": "FAST-JS180-1701111"}
    ],
    "publicBaseUrl": "https://phutungotoquyba.buiduchieu.id.vn"
}

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

response = requests.post(SYNC_URL, json=payload, headers=headers, timeout=30)
print(response.json())`;

  const curlSnippet = `# Lệnh cURL kiểm tra đồng bộ qua Terminal hoặc Postman
curl -X POST "${syncEndpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKeyInput || 'qba_live_your_secret_key'}" \\
  -d '{
    "items": [
      { "odooId": 101, "sku": "HOWO-WG9725540001" },
      { "odooId": 102, "sku": "FAST-JS180-1701111" }
    ]
  }'`;

  const hmacSnippet = `# Chuẩn xác thực chữ ký HMAC-SHA256 chống Replay Attack (5 phút)
import time, hmac, hashlib, requests

timestamp = str(int(time.time()))
signature = hmac.new(
    "${apiKeyInput || 'qba_live_your_secret_key'}".encode('utf-8'),
    timestamp.encode('utf-8'),
    hashlib.sha256
).hexdigest()

headers = {
    "Content-Type": "application/json",
    "x-odoo-timestamp": timestamp,
    "x-odoo-signature": signature
}

res = requests.post("${syncEndpointUrl}", json={"items": [...]}, headers=headers)`;

  return (
    <div className="space-y-5 pb-12 font-sans">
      {/* Toast Notification */}
      <ToastNotification toast={toastState} onClose={() => setToastState(null)} />

      {/* Header Bar (Matches /admin/settings style) */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Tích Hợp Odoo ERP & Quản Lý API Key
            </h1>
            <span
              className={`px-2 py-0.5 rounded font-extrabold text-[11px] ${
                syncEnabledState
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {syncEnabledState ? 'Hoạt Động BÌNH THƯỜNG' : 'TẠM TẮT ĐỒNG BỘ'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Quản lý khóa bí mật API (Shared Secret), điểm tiếp nhận Webhook và giám sát liên kết sản phẩm kho Q.BA với Odoo.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={testingConnection}
            onClick={handleTestConnection}
            className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/80 disabled:opacity-50"
          >
            {testingConnection ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Kiểm Tra Xác Thực</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSaveSettings()}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-lg border border-slate-200/80 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
          <p className="text-xs font-bold text-slate-600">Đang tải cấu hình kết nối Odoo ERP...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left 2 Cols: Main API Key & Integration Endpoints */}
          <div className="lg:col-span-2 space-y-5">
            {/* Box 1: API Key & Secret Management */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-red-600" />
                  <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    Khóa Xác Thực API (Machine-to-Machine Secret)
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  {data?.isCustomKey ? (
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-extrabold">
                      Khóa Tùy Chỉnh (DB)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold">
                      Khóa Mặc Định (.env)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsRegenerateModalOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs transition-colors flex items-center gap-1 border border-red-200/80 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-red-600" />
                    <span>Tạo Khóa Mới</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">
                    Giá Trị API Key Hiện Tại (*)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Nhập hoặc tạo API Key (VD: qba_live_...)"
                        className="w-full p-2.5 pr-10 border border-slate-200 rounded-md font-mono font-bold text-slate-900 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showKey ? 'Ẩn khóa' : 'Hiện khóa'}
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(apiKeyInput, 'key')}
                      className="px-3 py-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200/80 shrink-0"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Đã Chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-600" />
                          <span>Sao Chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1 leading-relaxed">
                  <div className="font-bold text-slate-800">Phương thức truyền khóa từ Odoo ERP:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 pl-1">
                    <li>
                      Gửi trực tiếp qua header: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-red-600 font-bold">x-api-key: {apiKeyInput ? `${apiKeyInput.slice(0, 12)}...` : 'KEY'}</code>
                    </li>
                    <li>
                      Hoặc gửi qua header Bearer: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-red-600 font-bold">Authorization: Bearer {'<API_KEY>'}</code>
                    </li>
                    <li>
                      Hoặc ký điện tử HMAC-SHA256: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold">x-odoo-timestamp</code> &amp; <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-800 font-semibold">x-odoo-signature</code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Box 2: Endpoints & Code Integration */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-red-600" />
                  <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    Điểm Tiếp Nhận Webhook & Đoạn Mã Mẫu
                  </h2>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      activeCodeTab === 'python'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Python (Odoo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('curl')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      activeCodeTab === 'curl'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    cURL / Postman
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('hmac')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      activeCodeTab === 'hmac'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    HMAC-SHA256
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* Endpoint row 1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-md bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-black shrink-0">
                      POST
                    </span>
                    <span className="font-mono text-slate-800 text-[11px] font-semibold truncate">
                      {syncEndpointUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">Đồng bộ theo SKU</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(syncEndpointUrl, 'url', 'sync')}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Sao chép URL"
                    >
                      {copiedUrl === 'sync' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Endpoint row 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-md bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-black shrink-0">
                      GET
                    </span>
                    <span className="font-mono text-slate-800 text-[11px] font-semibold truncate">
                      {data?.endpoints?.verifyAuth || '/api/v1/products/verify-auth'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">Kiểm tra kết nối</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(data?.endpoints?.verifyAuth || '', 'url', 'verify')}
                      className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                      title="Sao chép URL"
                    >
                      {copiedUrl === 'verify' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Block Container */}
                <div className="relative rounded-md bg-slate-900 text-slate-100 p-3.5 font-mono text-[11px] leading-relaxed border border-slate-800 overflow-x-auto">
                  <div className="absolute right-2.5 top-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const snippet =
                          activeCodeTab === 'python'
                            ? pythonSnippet
                            : activeCodeTab === 'curl'
                            ? curlSnippet
                            : hmacSnippet;
                        handleCopy(snippet, 'code');
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-slate-700 transition-colors"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Đã Chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Chép Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="pr-20 whitespace-pre-wrap">
                    {activeCodeTab === 'python' && pythonSnippet}
                    {activeCodeTab === 'curl' && curlSnippet}
                    {activeCodeTab === 'hmac' && hmacSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Status, History & Security Guidelines */}
          <div className="space-y-5">
            {/* Box 1: Integration Status & Last Sync */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Power className="w-4 h-4 text-red-600" />
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  Trạng Thái Nhận Dữ Liệu
                </h3>
              </div>

              <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Đồng Bộ Odoo ERP
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Cho phép nhận webhook từ Odoo
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={togglingSync}
                    onClick={handleToggleSync}
                    className={`p-1.5 rounded-md transition-all cursor-pointer font-extrabold text-xs flex items-center gap-1 disabled:opacity-50 ${
                      syncEnabledState
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {togglingSync ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : syncEnabledState ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>BẬT</span>
                      </>
                    ) : (
                      <span>TẮT</span>
                    )}
                  </button>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Đồng bộ gần nhất:</span>
                    <span className="font-bold text-slate-800">
                      {data?.lastSyncedAt
                        ? new Date(data.lastSyncedAt).toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : 'Chưa có dữ liệu'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Số lượng SKU khớp:</span>
                    <span className="font-black text-emerald-700">
                      {data?.lastSyncCount !== null && data?.lastSyncCount !== undefined
                        ? `${data.lastSyncCount} SKU`
                        : '0 SKU'}
                    </span>
                  </div>

                  {data?.lastSyncMessage && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                      {data.lastSyncMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="/admin/products"
                  className="w-full py-2 px-3 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-red-600" />
                  <span>Xem Sản Phẩm Kho Q.BA</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Box 2: Security & Protection Note (Matches /admin/settings) */}
            <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold block">Bảo Mật Cơ Sở Dữ Liệu:</span>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  Khóa API Key được lưu trữ trực tiếp trong PostgreSQL (bảng system_settings). Khi bấm "Tạo Khóa Mới", bạn cần dán khóa này vào cấu hình Webhook bên Odoo để tiếp tục đồng bộ.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Regenerate Key Modal */}
      <ConfirmModal
        isOpen={isRegenerateModalOpen}
        title="Tạo Lại API Key Mới Cho Odoo ERP"
        message="Hành động này sẽ cập nhật khóa mới vào hệ thống. Bạn cần sao chép và cập nhật khóa này vào Odoo ERP để các đợt đồng bộ tồn kho tiếp theo không bị gián đoạn. Bạn có chắc chắn muốn tiếp tục?"
        itemName={apiKeyInput}
        confirmText="Tạo Khóa Mới"
        cancelText="Hủy Bỏ"
        type="warning"
        isLoading={regenerating}
        onConfirm={handleRegenerateKey}
        onCancel={() => setIsRegenerateModalOpen(false)}
      />
    </div>
  );
}
