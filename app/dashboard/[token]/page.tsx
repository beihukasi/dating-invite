"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, MapPin, User, Clock, RefreshCw } from "lucide-react";

type DateItem = { id: string; dateLabel: string; dateValue: string };
type LocationItem = {
  id: string;
  name: string;
  note: string | null;
  createdBy: string;
};
type ResponseItem = {
  id: string;
  selectedDateId: string;
  selectedLocationId: string | null;
  locationName: string | null;
  locationNote: string | null;
  createdAt: string;
  date: DateItem;
  location: LocationItem | null;
};
type DashboardData = {
  girlName: string;
  createdAt: string;
  dates: DateItem[];
  locations: LocationItem[];
  responses: ResponseItem[];
};

export default function DashboardPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/${token}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
        setError("");
      } else {
        setError(json.error || "获取失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">📊</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
        <div className="text-center bg-white/80 backdrop-blur rounded-3xl p-8 shadow-xl">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-700 mb-2">{error}</h1>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Group responses by date
  const groupedByDate = data.dates.reduce(
    (acc, date) => {
      const dateResponses = data.responses.filter(
        (r) => r.selectedDateId === date.id
      );
      acc[date.id] = {
        dateLabel: date.dateLabel,
        dateValue: date.dateValue,
        responses: dateResponses,
      };
      return acc;
    },
    {} as Record<
      string,
      {
        dateLabel: string;
        dateValue: string;
        responses: ResponseItem[];
      }
    >
  );

  const totalResponses = data.responses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-200 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1 className="text-3xl font-bold text-gray-800">约会回复管理</h1>
          <p className="text-gray-500 mt-1">
            查看 {data.girlName} 的邀请回复情况
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <User className="w-5 h-5 text-pink-400 mx-auto" />
              <div className="text-2xl font-bold cute-gradient">{data.girlName}</div>
              <div className="text-xs text-gray-400">邀请对象</div>
            </div>
            <div className="space-y-1">
              <Calendar className="w-5 h-5 text-pink-400 mx-auto" />
              <div className="text-2xl font-bold text-gray-700">
                {data.dates.length}
              </div>
              <div className="text-xs text-gray-400">可选日期</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-pink-500">{totalResponses}</div>
              <div className="text-xs text-gray-400">回复人数</div>
            </div>
          </div>
        </div>

        {/* Responses by Date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">
              📅 按日期查看
            </h2>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 text-sm text-pink-500 hover:text-pink-600 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              刷新
            </button>
          </div>

          {data.dates.map((date) => {
            const group = groupedByDate[date.id];
            const responses = group?.responses || [];

            return (
              <div
                key={date.id}
                className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-bold text-gray-700">
                    {date.dateLabel}
                  </h3>
                  {responses.length > 0 && (
                    <span className="text-xs bg-pink-100 text-pink-600 px-3 py-1 rounded-full font-medium">
                      {responses.length}人选择
                    </span>
                  )}
                  {responses.length === 0 && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full">
                      暂无人选择
                    </span>
                  )}
                </div>

                {responses.length > 0 && (
                  <div className="space-y-3 ml-8">
                    {responses.map((r) => (
                      <div
                        key={r.id}
                        className="bg-pink-50 rounded-xl p-4 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-pink-400" />
                          <span className="font-semibold text-pink-700">
                            {data.girlName}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-medium text-gray-700">
                              {r.location?.name || r.locationName || "未选地点"}
                            </span>
                            {(r.location?.note || r.locationNote) && (
                              <p className="text-gray-400 text-sm mt-0.5">
                                💬 {r.location?.note || r.locationNote}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {new Date(r.createdAt).toLocaleString("zh-CN")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* All Locations */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
            📍 所有地点选项
          </h2>
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
            <div className="space-y-3">
              {data.locations.map((loc) => (
                <div
                  key={loc.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">{loc.name}</span>
                      {loc.createdBy === "guest" && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          女生添加
                        </span>
                      )}
                    </div>
                    {loc.note && (
                      <p className="text-gray-400 text-sm mt-0.5">{loc.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
