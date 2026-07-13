"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Copy, Check, Plus, X, Calendar, MapPin, ChevronDown, ChevronUp, RefreshCw, Clock, User, Link2, Trash2 } from "lucide-react";
import HeartRain from "@/components/HeartRain";

type DateItem = { dateLabel: string; dateValue: string };
type LocationItem = { name: string; note: string };

type SavedInvite = {
  id: string;
  girlName: string;
  dashboardToken: string;
  createdAt: string;
};

type DashboardData = {
  girlName: string;
  createdAt: string;
  dates: { id: string; dateLabel: string; dateValue: string }[];
  locations: { id: string; name: string; note: string | null; createdBy: string }[];
  responses: {
    id: string;
    selectedDateId: string;
    selectedLocationId: string | null;
    locationName: string | null;
    locationNote: string | null;
    createdAt: string;
    date: { id: string; dateLabel: string; dateValue: string };
    location: { id: string; name: string; note: string | null; createdBy: string } | null;
  }[];
};

const STORAGE_KEY = "dating-invites";

function loadInvites(): SavedInvite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInvites(invites: SavedInvite[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
}

export default function ManagePage() {
  // Create form state
  const [girlName, setGirlName] = useState("");
  const [dates, setDates] = useState<DateItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(true);

  // Saved invites
  const [savedInvites, setSavedInvites] = useState<SavedInvite[]>([]);

  // Result modal
  const [result, setResult] = useState<{
    inviteUrl: string;
    dashboardToken: string;
    girlName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Dashboard expansion
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashLoading, setDashLoading] = useState(false);

  useEffect(() => {
    setSavedInvites(loadInvites());
  }, []);

  const addDate = () => {
    if (!dateInput) return;
    const d = new Date(dateInput);
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const label = `${d.getMonth() + 1}月${d.getDate()}日（${weekDays[d.getDay()]}）`;
    if (dates.some((item) => item.dateValue === dateInput)) return;
    setDates([...dates, { dateLabel: label, dateValue: dateInput }]);
    setDateInput("");
  };

  const addLocation = () => {
    if (!locationName.trim()) return;
    if (locations.some((l) => l.name === locationName.trim())) return;
    setLocations([...locations, { name: locationName.trim(), note: locationNote.trim() }]);
    setLocationName("");
    setLocationNote("");
  };

  const handleCreate = async () => {
    if (!girlName.trim() || dates.length === 0 || locations.length === 0) {
      alert("请填写完整信息：女生名字、至少一个日期和至少一个地点");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ girlName: girlName.trim(), dates, locations }),
      });
      const data = await res.json();
      if (res.ok) {
        const newInvite: SavedInvite = {
          id: data.id,
          girlName: girlName.trim(),
          dashboardToken: data.dashboardToken,
          createdAt: new Date().toISOString(),
        };
        const updated = [newInvite, ...savedInvites];
        setSavedInvites(updated);
        saveInvites(updated);

        setResult({
          inviteUrl: data.inviteUrl,
          dashboardToken: data.dashboardToken,
          girlName: girlName.trim(),
        });

        // Reset form
        setGirlName("");
        setDates([]);
        setLocations([]);
        setShowForm(false);
      } else {
        alert(data.error || "创建失败");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setCreating(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteInvite = (id: string) => {
    const updated = savedInvites.filter((i) => i.id !== id);
    setSavedInvites(updated);
    saveInvites(updated);
    if (expandedId === id) {
      setExpandedId(null);
      setDashboardData(null);
    }
  };

  const toggleDashboard = useCallback(async (invite: SavedInvite) => {
    if (expandedId === invite.id) {
      setExpandedId(null);
      setDashboardData(null);
      return;
    }
    setExpandedId(invite.id);
    setDashLoading(true);
    try {
      const res = await fetch(`/api/dashboard/${invite.dashboardToken}`);
      const data = await res.json();
      if (res.ok) {
        setDashboardData(data);
      } else {
        setDashboardData(null);
      }
    } catch {
      setDashboardData(null);
    } finally {
      setDashLoading(false);
    }
  }, [expandedId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
      <HeartRain />
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-2">💝</div>
          <h1 className="text-3xl font-bold cute-gradient">约会邀请管理</h1>
        </div>

        {/* ---- Result Modal ---- */}
        {result && (
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 text-center space-y-4 bounce-in">
            <div className="text-4xl">💌</div>
            <h2 className="text-xl font-bold text-gray-800">
              给 <span className="cute-gradient">{result.girlName}</span> 的邀请已生成！
            </h2>
            <div className="bg-pink-50 rounded-2xl p-4 space-y-2">
              <label className="text-sm text-pink-600 font-medium flex items-center gap-1 justify-center">
                <Link2 className="w-4 h-4" /> 复制链接发给女生
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-left break-all select-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}{result.inviteUrl}
                </code>
                <button
                  onClick={() => copyText(`${window.location.origin}${result.inviteUrl}`)}
                  className="p-2.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-pink-500 text-sm hover:underline"
            >
              关闭
            </button>
          </div>
        )}

        {/* ---- Create Form ---- */}
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full p-5 flex items-center justify-between text-left hover:bg-pink-50/50 transition-colors"
          >
            <span className="font-bold text-gray-700 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              创建新邀请
            </span>
            {showForm ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {showForm && (
            <div className="px-5 pb-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1.5">
                  💕 女生名字
                </label>
                <input
                  type="text"
                  value={girlName}
                  onChange={(e) => setGirlName(e.target.value)}
                  placeholder="例如：沈湜"
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> 约会日期
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white transition-colors"
                  />
                  <button onClick={addDate} className="px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {dates.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {dates.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-pink-50 rounded-xl px-3 py-2 text-sm">
                        <span>📅 {d.dateLabel}</span>
                        <button onClick={() => setDates(dates.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-pink-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> 约会地点
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="地点名称"
                    className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationNote}
                      onChange={(e) => setLocationNote(e.target.value)}
                      placeholder="补充说明（选填）"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 placeholder-gray-400 transition-colors"
                    />
                    <button onClick={addLocation} className="px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {locations.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {locations.map((l, i) => (
                      <div key={i} className="flex items-center justify-between bg-pink-50 rounded-xl px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">📍 {l.name}</span>
                          {l.note && <span className="text-gray-400 ml-2">{l.note}</span>}
                        </div>
                        <button onClick={() => setLocations(locations.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all pulse-glow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? "正在生成..." : <><Heart className="w-5 h-5" /> 生成邀请链接</>}
              </button>
            </div>
          )}
        </div>

        {/* ---- My Invites ---- */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-3">
            📋 我的邀请
            {savedInvites.length > 0 && (
              <span className="text-sm font-normal text-gray-400">({savedInvites.length})</span>
            )}
          </h2>

          {savedInvites.length === 0 && (
            <div className="bg-white/60 backdrop-blur rounded-2xl p-8 text-center text-gray-400">
              <div className="text-3xl mb-2">📭</div>
              <p>还没有创建过邀请</p>
              <p className="text-sm mt-1">创建第一个邀请吧～</p>
            </div>
          )}

          <div className="space-y-3">
            {savedInvites.map((invite) => (
              <div key={invite.id} className="bg-white/80 backdrop-blur rounded-2xl shadow overflow-hidden">
                {/* Card header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-lg">
                      💕
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">{invite.girlName}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(invite.createdAt).toLocaleString("zh-CN")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(`${window.location.origin}/invite/${invite.id}`)}
                      className="p-2 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                      title="复制邀请链接"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleDashboard(invite)}
                      className={`p-2 rounded-lg transition-colors ${expandedId === invite.id ? "text-pink-500 bg-pink-50" : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"}`}
                      title="查看回复"
                    >
                      {expandedId === invite.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteInvite(invite.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded dashboard */}
                {expandedId === invite.id && (
                  <div className="border-t border-pink-100 p-4 bg-pink-50/30">
                    {dashLoading ? (
                      <div className="text-center py-4 text-gray-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                        加载中...
                      </div>
                    ) : dashboardData ? (
                      <div className="space-y-3">
                        {/* Summary */}
                        <div className="flex gap-3 text-center text-sm">
                          <div className="flex-1 bg-white rounded-xl p-3">
                            <div className="text-xl font-bold text-pink-500">{dashboardData.dates.length}</div>
                            <div className="text-gray-400 text-xs">可选日期</div>
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-3">
                            <div className="text-xl font-bold text-pink-500">{dashboardData.responses.length}</div>
                            <div className="text-gray-400 text-xs">已回复</div>
                          </div>
                          <div className="flex-1 bg-white rounded-xl p-3">
                            <div className="text-xl font-bold text-gray-500">{dashboardData.locations.length}</div>
                            <div className="text-gray-400 text-xs">可选地点</div>
                          </div>
                        </div>

                        {/* By date */}
                        {dashboardData.dates.map((date) => {
                          const dateResps = dashboardData.responses.filter(
                            (r) => r.selectedDateId === date.id
                          );
                          return (
                            <div key={date.id} className="bg-white rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-pink-400" />
                                <span className="font-medium text-gray-700 text-sm">{date.dateLabel}</span>
                                {dateResps.length > 0 ? (
                                  <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                                    {dateResps.length}人
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">暂无</span>
                                )}
                              </div>
                              {dateResps.map((r) => (
                                <div key={r.id} className="ml-6 bg-pink-50 rounded-lg p-2.5 text-sm space-y-1">
                                  <div className="flex items-center gap-1.5 text-gray-500">
                                    <User className="w-3.5 h-3.5" />
                                    {dashboardData.girlName}
                                  </div>
                                  <div className="flex items-start gap-1.5 text-gray-600">
                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span>{r.location?.name || r.locationName || "—"}</span>
                                  </div>
                                  {(r.location?.note || r.locationNote) && (
                                    <div className="text-gray-400 text-xs ml-5">
                                      💬 {r.location?.note || r.locationNote}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400 text-sm">暂无数据</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
