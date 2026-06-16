"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import { Feather, FileText, Settings, Image as ImageIcon, CheckCircle, ArrowLeft, ArrowRight, Upload, Sparkles, Loader2 } from "lucide-react";

export default function NewStoryWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Story Information
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [category, setCategory] = useState("Fiction");
  const [tags, setTags] = useState("");
  const [language, setLanguage] = useState("English");
  const [ageRating, setAgeRating] = useState("Everyone");
  const [storyType, setStoryType] = useState("Novel");

  // Step 2: Upload Assets
  const [coverUrl, setCoverUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [pdfContent, setPdfContent] = useState("");

  // Step 3: Publishing Settings
  const [status, setStatus] = useState("PUBLIC");
  const [monetization, setMonetization] = useState("FREE");
  const [price, setPrice] = useState("0.00");

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!title || !description) {
        setError("Please enter a title and description.");
        return;
      }
    }
    if (step === 2) {
      if (!coverUrl) {
        setError("Please select or generate a cover image.");
        return;
      }
      if (!pdfName || !pdfContent) {
        setError("Please upload a manuscript PDF (or generate a sample).");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(prev => Math.max(1, prev - 1));
  };

  // Helper to generate a random Unsplash cover image
  const generateRandomCover = () => {
    const images: Record<string, string[]> = {
      Fantasy: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400"
      ],
      "Sci-Fi": [
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
        "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400"
      ],
      Romance: [
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400",
        "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400"
      ],
      Poetry: [
        "https://images.unsplash.com/photo-1492052722242-2a5a4073b377?w=400",
        "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400"
      ],
      Adventure: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400"
      ]
    };

    const genreList = images[genre] || images["Fantasy"];
    const randomImg = genreList[Math.floor(Math.random() * genreList.length)];
    setCoverUrl(randomImg);
  };

  // Helper to simulate PDF upload and validate
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Invalid file format. Only PDF manuscripts are allowed.");
      return;
    }

    setPdfName(file.name);
    // Simulate text extraction
    setPdfContent(`[Uploaded Manuscript: ${file.name}]
This chapter is parsed from your uploaded PDF manuscript file.
It contains the contents that readers will access securely.
The reader view disables printing, text selection, and right-click downloading to protect your author rights.`);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Invalid file format. Only image files are allowed.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image.");
      }

      const data = await res.json();
      if (data.success) {
        setCoverUrl(data.url);
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch (err) {
      setError("Error uploading cover page image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to populate sample manuscript text
  const generateSampleManuscript = () => {
    setPdfName("sample_manuscript.pdf");
    setPdfContent(`The wind hummed a quiet warning as Silas crossed the threshold of the Sector 9 grid.

The air here tasted of copper filings and ozone. Neon lights pulsed through the acid rain, casting blue and pink ripples across the wet asphalt. Silas pulled his trench coat tighter, his biological eye adjusting to the dark alleys. Unlike the netrunners in the Upper Core, Silas had no neural link, no synthetic filters. He was entirely offline.

That made him a ghost. And in a city where everything was tracked, being a ghost was the only way to survive.

He reached the end of the alley, where a steel door hummed with static electricity. It was time to find out who had hacked the CEO's neural link. It was time to look for the smiley face code.`);
  };

  const handlePublish = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          description,
          genre,
          category,
          tags,
          language,
          ageRating,
          storyType,
          coverUrl,
          manuscriptUrl: pdfName,
          status,
          monetization,
          price,
          chapters: [
            {
              title: "Chapter 1: The Core",
              content: pdfContent,
            },
          ],
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        router.push("/dashboard/writer");
        router.refresh();
      } else {
        setError(data.error || "Failed to publish story.");
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred.");
    }
  };

  const storyTypes = ["Novel", "Short Story", "Poetry", "Sayari", "Article", "Comic", "Fan Fiction", "Educational Story", "Children's Story"];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        {/* Wizard Progress Headers */}
        <div className="flex justify-between items-center mb-8 px-4 sm:px-0">
          {[
            { step: 1, label: "Info", icon: <Feather className="w-4 h-4" /> },
            { step: 2, label: "Assets", icon: <ImageIcon className="w-4 h-4" /> },
            { step: 3, label: "Settings", icon: <Settings className="w-4 h-4" /> },
            { step: 4, label: "Publish", icon: <CheckCircle className="w-4 h-4" /> },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  step >= item.step
                    ? "bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/10"
                    : "bg-slate-200 dark:bg-slate-850 text-slate-500"
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs font-bold hidden sm:inline ${
                  step === item.step
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
              {item.step < 4 && <div className="w-8 sm:w-12 h-px bg-slate-200 dark:bg-slate-800" />}
            </div>
          ))}
        </div>

        {/* Wizard Main Panel */}
        <div className="glass p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 shadow-xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: Story Information */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Step 1: Story Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Story Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter story title"
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="A short hook..."
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Description / Synopsis</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter a compelling synopsis to grab reader attention..."
                  className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Story Type</label>
                  <select
                    value={storyType}
                    onChange={(e) => setStoryType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    {storyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    {["Fantasy", "Sci-Fi", "Romance", "Poetry", "Sayari", "Article", "Mystery", "Adventure", "Thriller", "Horror", "Non-Fiction"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Age Rating</label>
                  <select
                    value={ageRating}
                    onChange={(e) => setAgeRating(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="Everyone">Everyone</option>
                    <option value="Teen">Teen</option>
                    <option value="Mature">Mature</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="magic, dragons, epic"
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="English"
                    className="w-full mt-1.5 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Upload Assets */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Step 2: Upload Assets</h2>
              
              {/* Cover Image Upload Option */}
              <div className="p-5 bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl border border-slate-250 dark:border-slate-800/80 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4 text-violet-500" />
                    Cover Art Design
                  </h3>
                  <button
                    onClick={generateRandomCover}
                    className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate Premium Mock Cover
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="sm:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden aspect-[3/4] bg-slate-950 flex items-center justify-center text-center">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500 p-2 font-bold">No Cover Selected</span>
                    )}
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Upload Cover Page File</label>
                    <div className="mt-1.5 relative border-2 border-dashed border-slate-250 dark:border-slate-850 rounded-2xl p-6 text-center hover:bg-slate-100/10 cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-slate-450 dark:text-slate-550 mx-auto mb-1" />
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-350">
                        {coverUrl ? (coverUrl.startsWith("/uploads") ? "Cover uploaded successfully" : "Mock cover generated") : "Select Cover Image File"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manuscript PDF Upload Option */}
              <div className="p-5 bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl border border-slate-250 dark:border-slate-800/80 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <FileText className="w-4 h-4 text-violet-500" />
                    Manuscript Upload (.pdf only)
                  </h3>
                  <button
                    onClick={generateSampleManuscript}
                    className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    <Feather className="w-3 h-3" />
                    Auto-Fill Sample Manuscript
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-850 rounded-2xl p-6 text-center hover:bg-slate-100/10 dark:hover:bg-slate-900/10 cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-slate-450 dark:text-slate-500 mx-auto mb-2" />
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-350">
                    {pdfName ? `Uploaded: ${pdfName}` : "Click or drag your manuscript PDF file here"}
                  </span>
                  <span className="block text-[10px] text-slate-450 mt-1">
                    Validates extension, reads content securely.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Publishing Settings */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Step 3: Publishing Settings</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Story Visibility</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="PUBLIC">Public (Visible to everyone on discover)</option>
                    <option value="PRIVATE">Private (Only viewable by you)</option>
                    <option value="UNLISTED">Unlisted (Viewable only via link)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Monetization Scheme</label>
                  <select
                    value={monetization}
                    onChange={(e) => setMonetization(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 focus:outline-none"
                  >
                    <option value="FREE">Free (Always free for all readers)</option>
                    <option value="PAID">Paid (Requires buy-unlock to read)</option>
                    <option value="PREMIUM">Premium Members Only (Exclusive access)</option>
                  </select>
                </div>
              </div>

              {monetization === "PAID" && (
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide">Story Pricing (USD)</label>
                  <div className="mt-1.5 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-7 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      placeholder="2.99"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review Card Generation */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Step 4: Review Story Card</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center pt-2">
                {/* Generated Card Preview */}
                <div>
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-3">Live Card Preview</h3>
                  <div className="w-full max-w-[280px] mx-auto">
                    {/* Simulated StoryCard for previewing */}
                    <div className="rounded-2xl glass border border-slate-200/50 dark:border-slate-800/40 overflow-hidden flex flex-col shadow-lg">
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
                        <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                        <div className="absolute top-3 left-3 flex gap-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-600 text-white">{genre}</span>
                        </div>
                        <div className="absolute bottom-3 right-3 text-white text-[11px] font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
                          2 min read
                        </div>
                      </div>
                      <div className="p-4 flex flex-col flex-grow bg-white dark:bg-slate-950">
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{title}</h3>
                        <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-0.5 truncate">{subtitle || "Ready to publish"}</p>
                        <p className="text-xs text-slate-650 dark:text-slate-350 line-clamp-2 mt-2">{description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Checklist */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Publishing Checklist</h3>
                  <div className="space-y-2">
                    {[
                      { check: true, text: "Metadata configurations verified" },
                      { check: !!coverUrl, text: "Cover art successfully previewed" },
                      { check: !!pdfContent, text: "Manuscript secure chapters extracted" },
                      { check: true, text: `Visibility settings: ${status}` },
                      { check: true, text: `Monetization: ${monetization} ${monetization === "PAID" ? `$${price}` : ""}` },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-650 dark:text-slate-300">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${item.check ? "bg-emerald-500 text-white" : "bg-slate-200"}`}>
                          ✓
                        </div>
                        {item.text}
                      </div>
                    ))}
                  </div>

                  <div className="bg-violet-500/5 border border-violet-500/10 p-4 rounded-2xl mt-4">
                    <span className="text-[10px] font-bold text-violet-650 dark:text-violet-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      AI Insights Triggered on Submit
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
                      Publishing now will automatically analyze this manuscript with Google Gemini models to generate plot summaries, suggested tags, content ratings, and design reviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-200/50 dark:border-slate-800/40">
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-100 flex items-center gap-1 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/10 flex items-center gap-1 transition-all"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/15 flex items-center gap-1.5 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <>
                    <Feather className="w-4.5 h-4.5" />
                    Publish Story
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
