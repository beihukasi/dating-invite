"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Copy, Check, Plus, X, Calendar, MapPin } from "lucide-react";
import HeartRain from "@/components/HeartRain";

type DateItem = { dateLabel: string; dateValue: string };
type LocationItem = { name: string; note: string };

export default function CreatePage() {
  const router = useRouter();
  const [girlName, setGirlName] = useState("");
  const [dates, setDates] = useState<DateItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [dateInput, setDateInput] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    inviteUrl: string;
    dashboardUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState<"invite" | "dashboard" | null>(null);

  const addDate = () => {
    if (!dateInput) return;
    const d = new Date(dateInput);
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const label = `${d.getMonth() + 1}月${d.getDate()}日（${weekDays[d.getDay()]}）`;
    if (dates.some((item) => item.dateValue === dateInput)) return;
    setDates([...dates, { dateLabel: label, dateValue: dateInput }]);
    setDateInput("");
  };

  const removeDate = (i: number) => {
    setDates(dates.filter((_, idx) => idx !== i));
  };

  const addLocation = () => {
    if (!locationName.trim()) return;
    if (locations.some((l) => l.name === locationName.trim())) return;
    setLocations([...locations, { name: locationName.trim(), note: locationNote.trim() }]);
    setLocationName("");
    setLocationNote("");
  };

  const removeLocation = (i: number) => {
    setLocations(locations.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!girlName.trim() || dates.length === 0 || locations.length === 0) {
      alert("请填写完整信息：女生名字、至少一个日期和至少一个地点");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          girlName: girlName.trim(),
          dates,
          locations,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({
          inviteUrl: data.inviteUrl,
          dashboardUrl: data.dashboardUrl,
        });
      } else {
        alert(data.error || "创建失败");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (type: "invite" | "dashboard", path: string) => {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
        <HeartRain />
        <div className="max-w-md w-full bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 text-center space-y-6 bounce-in">
          <div className="text-4xl">💌</div>
          <h1 className="text-2xl font-bold cute-gradient">邀请已生成！</h1>

          <div className="space-y-4">
            <div className="bg-pink-50 rounded-2xl p-4 space-y-2">
              <label className="text-sm text-pink-600 font-medium flex items-center gap-1 justify-center">
                <Heart className="w-4 h-4" /> 邀请链接（发给女生）
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-left break-all">
                  {window.location.origin}{result.inviteUrl}
                </code>
                <button
                  onClick={() => copyToClipboard("invite", result.inviteUrl)}
                  className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shrink-0"
                >
                  {copied === "invite" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 space-y-2">
              <label className="text-sm text-amber-600 font-medium flex items-center gap-1 justify-center">
                📊 管理链接（仅自己保存）
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-left break-all">
                  {window.location.origin}{result.dashboardUrl}
                </code>
                <button
                  onClick={() => copyToClipboard("dashboard", result.dashboardUrl)}
                  className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shrink-0"
                >
                  {copied === "dashboard" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            💡 请妥善保存管理链接，这是查看回复的唯一入口
          </p>

          <button
            onClick={() => {
              setResult(null);
              setGirlName("");
              setDates([]);
              setLocations([]);
            }}
            className="text-pink-500 text-sm hover:underline"
          >
            再创建一个
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
      <HeartRain />
      <div className="max-w-lg mx-auto pt-8 pb-16">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💝</div>
          <h1 className="text-3xl font-bold cute-gradient">创建约会邀请</h1>
          <p className="text-gray-500 mt-2">填写信息，生成专属邀请链接发给心仪的她</p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-6 space-y-6">
          {/* 女生名字 */}
          <div>
            <label className="block text-sm font-semibold text-pink-700 mb-2">
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

          {/* 约会日期 */}
          <div>
            <label className="block text-sm font-semibold text-pink-700 mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> 约会日期（可多个）
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 transition-colors"
              />
              <button
                onClick={addDate}
                className="px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" /> 添加
              </button>
            </div>
            {dates.length > 0 && (
              <div className="mt-3 space-y-2">
                {dates.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-pink-50 rounded-xl px-4 py-2"
                  >
                    <span className="text-gray-700">
                      📅 {d.dateLabel}
                    </span>
                    <button
                      onClick={() => removeDate(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 约会地点 */}
          <div>
            <label className="block text-sm font-semibold text-pink-700 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> 约会地点（可多个）
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="地点名称（如：西湖边的咖啡馆）"
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
                <button
                  onClick={addLocation}
                  className="px-4 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" /> 添加
                </button>
              </div>
            </div>
            {locations.length > 0 && (
              <div className="mt-3 space-y-2">
                {locations.map((l, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-pink-50 rounded-xl px-4 py-3"
                  >
                    <div>
                      <div className="text-gray-700 font-medium">📍 {l.name}</div>
                      {l.note && (
                        <div className="text-gray-400 text-sm mt-0.5">{l.note}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeLocation(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all pulse-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              "正在生成..."
            ) : (
              <>
                <Heart className="w-5 h-5" /> 生成邀请链接
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
