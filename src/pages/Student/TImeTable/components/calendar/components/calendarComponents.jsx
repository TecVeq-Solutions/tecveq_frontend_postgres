import { useEffect, useState } from "react";

import moment from "moment";
import { calculateDurationHours } from "../../../../../../utils/timeUtils";
import FilterButton from "./FilterButton";
import IMAGES from "../../../../../../assets/images";
import ViewEventDetailsModal from "./viewEventDetailsModal";

import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";


export const CustomEvent = ({ event, setevents }) => {
  const [detailsModalOpen, setdetailsModalOpen] = useState(false);
  
  // Calculate event duration in hours for height scaling
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const durationHours = calculateDurationHours(startTime, endTime);
  const eventHeight = Math.max(100, durationHours * 100); // Minimum 100px, scale by 100px per hour

  return (
    <div className="relative flex flex-1 w-full overflow-visible mb-1">
      {detailsModalOpen && <ViewEventDetailsModal
        setevents={setevents}
        event={event}
        open={detailsModalOpen}
        setopen={setdetailsModalOpen}
      />}
      
      <div
        onClick={() => {
          if (event?.teacher?.name) {
            setdetailsModalOpen(true);
          }
        }}
        className="cursor-pointer w-full overflow-hidden group"
        style={{
          height: `${eventHeight - 4}px`,
          minHeight: `${eventHeight - 4}px`,
          background: "linear-gradient(135deg, #EEF0FF 0%, #F5F3FF 100%)",
          border: "1.5px solid #C7C9F0",
          borderLeft: "3px solid #6A00FF",
          borderRadius: "10px",
          boxShadow: "0 1px 4px rgba(106,0,255,0.06)",
          transition: "all 0.18s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(106,0,255,0.15)";
          e.currentTarget.style.borderColor = "#8B2FFF";
          e.currentTarget.style.borderLeftColor = "#6A00FF";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(106,0,255,0.06)";
          e.currentTarget.style.borderColor = "#C7C9F0";
          e.currentTarget.style.borderLeftColor = "#6A00FF";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Top accent bar */}
        <div style={{
          height: "2px",
          background: "linear-gradient(90deg, #6A00FF, #A855F7)",
          opacity: 0.5,
        }} />

        <div className="flex flex-col justify-start items-start px-2 pt-1 pb-1 gap-[3px]">
          {/* Teacher */}
          <div className="flex items-center gap-1 w-full">
            <span style={{
              fontSize: "8px",
              fontWeight: 600,
              color: "#8B5CF6",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}>Teacher</span>
            <span style={{
              fontSize: "9px",
              color: "#1E1B4B",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "70%",
            }}>
              {event?.teacher?.name ?? "—"}
            </span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#3B0764",
            lineHeight: "1.2",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}>
            {event?.title || "Untitled"}
          </div>

          {/* Subject chip */}
          {event?.subject?.name && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(106,0,255,0.08)",
              borderRadius: "4px",
              padding: "1px 5px",
              maxWidth: "100%",
            }}>
              <span style={{
                fontSize: "8px",
                color: "#6A00FF",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {event?.subject?.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SideTime = (props) => {
  const times = props.slotMetrics.groups;

  return (
    <div className="flex flex-col" style={{ width: "110px" }}>
      {times.map((time, index) => {
        const startTime = moment.utc(time[0]).tz("Asia/Karachi");
        const endTime = index < times.length - 1
          ? moment.utc(times[index + 1][0]).tz("Asia/Karachi")
          : startTime.clone().add(1, "hour");

        return (
          <div
            key={`${time}2`}
            style={{
              width: "110px",
              height: "100px",
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderBottom: "1px solid #EDE9FE",
              padding: "8px 4px",
              background: index % 2 === 0 ? "#FAFAFA" : "#FFFFFF",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#6A00FF",
                margin: 0,
                lineHeight: 1.3,
              }}>
                {startTime.format("h:mm")}
                <span style={{ fontSize: "9px", fontWeight: 400, marginLeft: "2px", color: "#8B5CF6" }}>
                  {startTime.format("a")}
                </span>
              </p>
              <p style={{ fontSize: "10px", color: "#C4B5FD", margin: "1px 0" }}>│</p>
              <p style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#9CA3AF",
                margin: 0,
                lineHeight: 1.3,
              }}>
                {endTime.format("h:mm")}
                <span style={{ fontSize: "9px", marginLeft: "2px" }}>
                  {endTime.format("a")}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const SideTimeHeader = (props) => {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "linear-gradient(135deg, #F3EEFF, #EDE9FE)",
        border: "1px solid #DDD6FE",
        borderRadius: "8px",
        padding: "4px 10px",
      }}>
        <div style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#6A00FF",
          boxShadow: "0 0 0 2px rgba(106,0,255,0.2)",
        }} />
        <p style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#6A00FF",
          margin: 0,
          letterSpacing: "0.3px",
        }}>GMT +5</p>
      </div>
    </div>
  );
};

export const Header = (props) => {
  const day = moment(props.date).format("ddd");
  const currentDate = moment(Date.now()).date();
  const currentMonth = moment(Date.now()).month();
  const date = moment(props.date).date();
  const month = moment(props.date).month();
  const isToday = currentDate === date && currentMonth === month;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px 2px",
      gap: "4px",
    }}>
      <div style={{
        width: "34px",
        height: "34px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isToday
          ? "linear-gradient(135deg, #6A00FF, #9333EA)"
          : "transparent",
        boxShadow: isToday ? "0 4px 12px rgba(106,0,255,0.3)" : "none",
        transition: "all 0.2s ease",
      }}>
        <p style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: isToday ? 700 : 500,
          color: isToday ? "#FFFFFF" : "#374151",
          lineHeight: 1,
        }}>
          {date}
        </p>
      </div>
      <p style={{
        margin: 0,
        fontSize: "10px",
        fontWeight: 500,
        color: isToday ? "#6A00FF" : "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
        {day}
      </p>
    </div>
  );
};

export const CustomToolbar = ({
  toolbar,
  setaddModalOpen,
  addModalOpen,
}) => {
  const goToBack = () => toolbar.onNavigate("PREV");
  const goToNext = () => toolbar.onNavigate("NEXT");
  
  // Current visible date from calendar (updates on navigate)
  const visibleDate = toolbar.date ? moment(toolbar.date) : moment();

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      padding: "14px 20px",
      background: "#FFFFFF",
      borderRadius: "16px",
      boxShadow: "0 1px 12px rgba(106,0,255,0.07), 0 1px 3px rgba(0,0,0,0.04)",
      border: "1px solid #EDE9FE",
      marginBottom: "16px",
    }}>

      {/* ── Date Navigator ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={goToBack}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            border: "1.5px solid #E5E7EB",
            background: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
            color: "#374151",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#F3EEFF";
            e.currentTarget.style.borderColor = "#DDD6FE";
            e.currentTarget.style.color = "#6A00FF";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#FAFAFA";
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.color = "#374151";
          }}
        >
          <MdKeyboardArrowLeft size={18} />
        </button>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1px",
        }}>
          <p style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: 700,
            color: "#6A00FF",
            letterSpacing: "-0.3px",
          }}>
            {visibleDate.format("DD MMMM, YYYY")}
          </p>
          <p style={{
            margin: 0,
            fontSize: "10px",
            fontWeight: 500,
            color: "#A78BFA",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          }}>
            {visibleDate.isSame(moment(), "day") ? "Today" : visibleDate.format("dddd")}
          </p>
        </div>

        <button
          onClick={goToNext}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            border: "1.5px solid #E5E7EB",
            background: "#FAFAFA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
            color: "#374151",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#F3EEFF";
            e.currentTarget.style.borderColor = "#DDD6FE";
            e.currentTarget.style.color = "#6A00FF";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#FAFAFA";
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.color = "#374151";
          }}
        >
          <MdKeyboardArrowRight size={18} />
        </button>
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <FilterButton
          className={"px-2 sm:px-4 py-2 text-sm sm:text-base"}
          icon={true}
          text={"Filter Classes"}
          clickHandler={() => setaddModalOpen(!addModalOpen)}
          style={{
            background: "#F3EEFF",
            color: "#6A00FF",
            border: "1.5px solid #DDD6FE",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "13px",
            padding: "8px 16px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        />
      </div>
    </div>
  );
};
