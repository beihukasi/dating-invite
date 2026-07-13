"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Heart, MapPin, Calendar, Plus, Check, Sparkles } from "lucide-react";
import HeartRain from "@/components/HeartRain";
import RunningButton from "@/components/RunningButton";

type DateItem = { id: string; dateLabel: string; dateValue: string };
type LocationItem = {
  id: string;
  name: string;
  note: string | null;
  createdBy: string;
};

export default function InvitePage() {
  const params = useParams();
  const id = params.id as string;

  const [stage, setStage] = useState(1);
  const [girlName, setGirlName] = useState("");
  const [dates, setDates] = useState<DateItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/invites/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setGirlName(data.girlName);
          setDates(data.dates);
          setLocations(data.locations);
        }
      })
      .catch(() => setError("加载失败，请检查链接"))
      .finally(() => setLoading(false));
  }, [id]);

  const addCustomLocation = useCallback(async () => {
    if (!customLocation.trim()) return;
    try {
      const res = await fetch(`/api/invites/${id}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customLocation.trim(), note: customNote.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setLocations([...locations, data.location]);
        setSelectedLocationId(data.location.id);
        setCustomLocation("");
        setCustomNote("");
        setShowAddLocation(false);
      }
    } catch {
      alert("添加失败");
    }
  }, [customLocation, customNote, id, locations]);

  const handleSubmitResponse = async () => {
    if (!selectedDateId) {
      alert("请先选择一个约会日期哦～");
      return;
    }
    if (!selectedLocationId && !customLocation.trim()) {
      alert("请选择一个约会地点哦～");
      return;
    }

    setSubmitting(true);
    try {
      let locationId = selectedLocationId;

      // If user added a custom location but didn't save it yet
      if (!locationId && customLocation.trim()) {
        const locRes = await fetch(`/api/invites/${id}/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: customLocation.trim(), note: customNote.trim() }),
        });
        const locData = await locRes.json();
        if (locRes.ok) {
          locationId = locData.location.id;
        }
      }

      const res = await fetch(`/api/invites/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedDateId,
          selectedLocationId: locationId || null,
          locationName: locationId ? undefined : customLocation.trim(),
          locationNote: locationId ? undefined : customNote.trim(),
        }),
      });

      if (res.ok) {
        setStage(4);
      } else {
        const data = await res.json();
        alert(data.error || "提交失败");
      }
    } catch {
      alert("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">💕</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
        <div className="text-center bg-white/80 backdrop-blur rounded-3xl p-8 shadow-xl">
          <div className="text-4xl mb-4">😢</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">{error}</h1>
          <p className="text-gray-400">也许你可以问问发链接的人～</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 flex items-center justify-center p-4">
      <HeartRain />

      {/* Stage 1: Invitation */}
      {stage === 1 && (
        <div className="text-center space-y-8 relative z-10">
          <div className="bounce-in space-y-4">
            <div className="text-6xl">💌</div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-relaxed">
              你好，可爱的
              <span className="cute-gradient text-4xl md:text-5xl mx-2">
                {girlName}
              </span>
              小姐 💕
            </h1>
            <p className="text-2xl text-gray-600 mt-4">
              可以和我一起约会吗？
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 relative">
            {/* 不愿意 — 会逃跑的按钮 */}
            <RunningButton />

            {/* 愿意 — 正常点击 */}
            <button
              onClick={() => setStage(2)}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xl rounded-full shadow-lg hover:shadow-xl pulse-glow relative z-10 transition-transform hover:scale-105"
            >
              ❤️ 愿意
            </button>
          </div>
        </div>
      )}

      {/* Stage 2: Select Date */}
      {stage === 2 && (
        <div className="max-w-lg w-full bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 space-y-6 bounce-in relative z-10">
          <div className="text-center">
            <div className="text-4xl mb-3">📅</div>
            <h2 className="text-2xl font-bold cute-gradient">
              选择一个约会日期吧～
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              哪天比较方便呢？
            </p>
          </div>

          <div className="space-y-3">
            {dates.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDateId(d.id)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                  selectedDateId === d.id
                    ? "border-pink-400 bg-pink-50 shadow-lg shadow-pink-100"
                    : "border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/50"
                }`}
              >
                <Calendar
                  className={`w-5 h-5 shrink-0 ${
                    selectedDateId === d.id ? "text-pink-500" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-lg ${
                    selectedDateId === d.id
                      ? "text-pink-700 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {d.dateLabel}
                </span>
                {selectedDateId === d.id && (
                  <Check className="w-5 h-5 text-pink-500 ml-auto" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => selectedDateId && setStage(3)}
            disabled={!selectedDateId}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一步 →
          </button>
        </div>
      )}

      {/* Stage 3: Select Location */}
      {stage === 3 && (
        <div className="max-w-lg w-full bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 space-y-6 bounce-in relative z-10">
          <div className="text-center">
            <div className="text-4xl mb-3">📍</div>
            <h2 className="text-2xl font-bold cute-gradient">
              想去哪里约会呢？
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              选一个喜欢的地方吧～
            </p>
          </div>

          {/* Existing locations */}
          <div className="space-y-3">
            {locations.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLocationId(l.id);
                  setCustomLocation("");
                  setShowAddLocation(false);
                }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedLocationId === l.id
                    ? "border-pink-400 bg-pink-50 shadow-lg shadow-pink-100"
                    : "border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    className={`w-5 h-5 shrink-0 ${
                      selectedLocationId === l.id ? "text-pink-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-lg ${
                      selectedLocationId === l.id
                        ? "text-pink-700 font-semibold"
                        : "text-gray-600"
                    }`}
                  >
                    {l.name}
                  </span>
                  {selectedLocationId === l.id && (
                    <Check className="w-5 h-5 text-pink-500 ml-auto" />
                  )}
                  {l.createdBy === "guest" && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                      女生添加
                    </span>
                  )}
                </div>
                {l.note && (
                  <p className="text-gray-400 text-sm mt-1 ml-8">{l.note}</p>
                )}
              </button>
            ))}
          </div>

          {/* Add custom location */}
          {!showAddLocation && (
            <button
              onClick={() => {
                setShowAddLocation(true);
                setSelectedLocationId(null);
              }}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-pink-300 text-pink-400 hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> 没有想去的？自己添加一个
            </button>
          )}

          {showAddLocation && (
            <div className="bg-pink-50 rounded-2xl p-4 space-y-3">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="输入你想去的地方..."
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 placeholder-gray-400"
              />
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="补充说明（选填）"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none bg-white text-gray-800 placeholder-gray-400"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddLocation(false)}
                  className="flex-1 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={addCustomLocation}
                  disabled={!customLocation.trim()}
                  className="flex-1 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-30"
                >
                  确认添加
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmitResponse}
            disabled={submitting || (!selectedLocationId && !customLocation.trim())}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              "提交中..."
            ) : (
              <>
                <Heart className="w-5 h-5" /> 确认约会！
              </>
            )}
          </button>
        </div>
      )}

      {/* Stage 4: Sweet Ending */}
      {stage === 4 && (
        <div className="max-w-lg w-full text-center space-y-8 bounce-in relative z-10">
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="text-6xl">🥰</div>
            <h2 className="text-3xl font-bold cute-gradient">
              太开心啦！
            </h2>
            <div className="space-y-2 text-gray-600 text-lg leading-relaxed">
              <p>
                期待在
                <span className="text-pink-600 font-semibold mx-1">
                  {dates.find((d) => d.id === selectedDateId)?.dateLabel || "那一天"}
                </span>
                和你一起去
                <span className="text-pink-600 font-semibold mx-1">
                  {locations.find((l) => l.id === selectedLocationId)?.name || customLocation}
                </span>
                ～
              </p>
              <p className="text-xl mt-4">✨</p>
              <p>我已经开始期待那一天了 💕</p>
              <p>会准备好一切，就等你来～</p>
            </div>
            <div className="flex justify-center gap-4 text-4xl pt-4">
              <span className="animate-bounce" style={{ animationDelay: "0s" }}>
                💕
              </span>
              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                💖
              </span>
              <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                💗
              </span>
            </div>
            <div className="pt-4">
              <Sparkles className="w-6 h-6 text-pink-400 mx-auto animate-spin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
