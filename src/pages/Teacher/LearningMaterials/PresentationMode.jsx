import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Maximize, Edit2, Eraser, Undo, RefreshCw, Layers } from "lucide-react";
import { getTeacherMaterialById } from "../../../api/Teacher/LearningMaterials";
import { useQuery } from "@tanstack/react-query";

const PresentationMode = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Either we get material from state, or fetch it if directly linked
  const initialMaterial = location.state;
  
  const { data: individualMaterial } = useQuery({
    queryKey: ["teacherMaterial", id],
    queryFn: () => getTeacherMaterialById(id),
    enabled: !initialMaterial && !!id,
  });

  const material = initialMaterial || individualMaterial?.data;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [tool, setTool] = useState("pen"); // "pen" or "eraser"
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Undo stack
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);

  useEffect(() => {
    if (showWhiteboard && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
      
      redrawCanvas();
    }
  }, [showWhiteboard, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Canvas drawing logic
  const startDrawing = (e) => {
    if (!ctxRef.current || !showWhiteboard) return;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(clientX, clientY);
    setIsDrawing(true);
    setCurrentPath([{ x: clientX, y: clientY, tool }]);
  };

  const draw = (e) => {
    if (!isDrawing || !ctxRef.current || !showWhiteboard) return;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    
    ctxRef.current.lineTo(clientX, clientY);
    ctxRef.current.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : "#6A00FF";
    ctxRef.current.lineWidth = tool === "eraser" ? 20 : 3;
    
    if (tool === "eraser") {
      ctxRef.current.globalCompositeOperation = "destination-out";
    } else {
      ctxRef.current.globalCompositeOperation = "source-over";
    }
    
    ctxRef.current.stroke();
    setCurrentPath((prev) => [...prev, { x: clientX, y: clientY, tool }]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    ctxRef.current?.closePath();
    setIsDrawing(false);
    if (currentPath.length > 0) {
      setPaths((prev) => [...prev, currentPath]);
    }
    setCurrentPath([]);
  };

  const redrawCanvas = () => {
    if (!ctxRef.current || !canvasRef.current) return;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    paths.forEach(path => {
      if (path.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach(point => {
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = point.tool === "eraser" ? "rgba(0,0,0,1)" : "#6A00FF";
        ctx.lineWidth = point.tool === "eraser" ? 20 : 3;
        ctx.globalCompositeOperation = point.tool === "eraser" ? "destination-out" : "source-over";
        ctx.stroke();
      });
      ctx.closePath();
    });
  };

  const handleUndo = () => {
    setPaths((prev) => {
      const newPaths = [...prev];
      newPaths.pop();
      return newPaths;
    });
  };

  useEffect(() => {
    if (showWhiteboard) redrawCanvas();
  }, [paths]);

  const handleClear = () => {
    setPaths([]);
  };

  if (!material) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading presentation...</div>;
  }

  return (
    <div ref={containerRef} className="relative w-screen h-screen bg-black overflow-hidden font-poppins">
      
      {/* Content Viewer */}
      <div className="absolute inset-0 flex items-center justify-center">
        {material.videoUrl && material.videoUrl.trim() !== "" ? (
          material.videoUrl.includes("youtube.com") || material.videoUrl.includes("youtu.be") ? (
            <iframe
              src={material.videoUrl.replace("watch?v=", "embed/")}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={material.videoUrl}
              className="w-full h-full object-contain"
              controls
              controlsList="nodownload"
            />
          )
        ) : material.materialType === "Image" ? (
          <img src={material.fileUrl} alt="Presentation" className="max-w-full max-h-full object-contain" />
        ) : material.materialType === "PDF" ? (
          <iframe src={`${material.fileUrl}#toolbar=0`} className="w-full h-full bg-white" />
        ) : material.fileUrl ? (
          // Use Google Docs Viewer for PPT, Word, etc.
          <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(material.fileUrl)}&embedded=true`} className="w-full h-full bg-white" />
        ) : (
          <div className="text-white/50 text-xl">No content available to present</div>
        )}
      </div>

      {/* Whiteboard Overlay */}
      {showWhiteboard && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-40 touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ pointerEvents: showWhiteboard ? "auto" : "none" }}
        />
      )}

      {/* Floating Toolbar */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 ${showWhiteboard ? "ring-2 ring-purple-500/50" : ""}`}>
        
        <button onClick={() => navigate(-1)} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title="Exit Presentation">
          <ArrowLeft size={20} />
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button 
          onClick={() => setShowWhiteboard(!showWhiteboard)} 
          className={`p-2.5 rounded-xl transition-colors ${showWhiteboard ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
          title="Toggle Whiteboard"
        >
          <Layers size={20} />
        </button>

        {showWhiteboard && (
          <>
            <button 
              onClick={() => setTool("pen")} 
              className={`p-2.5 rounded-xl transition-colors ${tool === "pen" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Pen"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => setTool("eraser")} 
              className={`p-2.5 rounded-xl transition-colors ${tool === "eraser" ? "bg-white/20 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
              title="Eraser"
            >
              <Eraser size={18} />
            </button>
            <button onClick={handleUndo} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title="Undo">
              <Undo size={18} />
            </button>
            <button onClick={handleClear} className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors" title="Clear All">
              <RefreshCw size={18} />
            </button>
          </>
        )}

        <div className="w-px h-6 bg-white/10 mx-1" />

        <button onClick={toggleFullscreen} className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title="Fullscreen">
          <Maximize size={20} />
        </button>

      </div>
      
      {/* Title Overlay (Top Left) */}
      <div className="absolute top-6 left-6 z-30 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
        <h2 className="text-white font-semibold text-sm drop-shadow-md">{material.title}</h2>
        <p className="text-white/60 text-[10px]">{material.subject?.name} • {material.classroom?.name}</p>
      </div>

    </div>
  );
};

export default PresentationMode;
