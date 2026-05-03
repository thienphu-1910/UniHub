import { Clock5, Building, Snowflake, UserStar } from "lucide-react";
import { formatDate } from "../../utils/datetime";
import { formatToVND } from "../../utils/currency";

const WorkshopDetail = ({ workshop }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-8 shadow-sm">
      {/* Title & Price Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl font-bold text-slate-900">
            {workshop.title}
          </h2>
        </div>
        <div className="flex flex-col sm:items-end text-left sm:text-right">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-700 font-bold text-2xl">
              {formatToVND(workshop.price)}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
            Per Participant
          </span>
        </div>
      </div>

      {/* Description */}
      {workshop?.description?.length > 0 && (
        <p className="text-slate-600 text-base font-semibold leading-relaxed">
          {workshop.description}
        </p>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 py-2">
        <div className="flex flex-row gap-3 items-start">
          <div className="rounded border border-blue-100 p-2 bg-blue-50/50 text-blue-600">
            <Clock5 className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Time Schedule
            </span>
            <span className="font-semibold text-slate-800 text-sm">
              {formatDate(workshop.startTime)}
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-3 items-start">
          <div className="rounded border border-blue-100 p-2 bg-blue-50/50 text-blue-600">
            <Building className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              Location
            </span>
            <span className="font-semibold text-slate-800 text-sm">
              {workshop.room}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Sections (Rendered Open) */}
      <div className="w-full flex flex-col gap-4">
        {/* AI Summary */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-row gap-2 items-center">
            <Snowflake className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm text-slate-800">
              AI Summary
            </span>
          </div>
          <div className="px-5 py-4 bg-white">
            <p className="text-slate-700 text-sm italic leading-relaxed">
              "{workshop.aiSummary || "No summary provided."}"
            </p>
          </div>
        </div>

        {/* Speaker Info */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-row gap-2 items-center">
            <UserStar className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm text-slate-800">
              Speaker Info
            </span>
          </div>
          <div className="px-5 py-4 bg-white flex flex-row gap-4 items-center">
            <img
              src={workshop?.speaker?.avatarUrl}
              alt="Speaker Avatar"
              className="w-12 h-12 rounded object-cover shadow-sm border border-slate-100"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-900">
                {workshop?.speaker?.name}
              </span>
              <span className="text-sm text-slate-500 mt-0.5">
                {workshop?.speaker?.bio}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetail;
