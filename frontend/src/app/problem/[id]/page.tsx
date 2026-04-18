"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { socket } from "@/socket";
import Editor from "@monaco-editor/react";
import {
  ChevronLeft,
  Play,
  Send,
  Check,
  X,
  Clock,
  Cpu,
  Terminal,
  FileCode,
  ChevronDown,
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", monacoLang: "javascript", boilerplate: "// Write your solution here\nfunction solve(input) {\n  \n}\n" },
  { id: "python", label: "Python", monacoLang: "python", boilerplate: "# Write your solution here\ndef solve(input):\n    pass\n" },
  { id: "java", label: "Java", monacoLang: "java", boilerplate: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n" },
  { id: "cpp", label: "C++", monacoLang: "cpp", boilerplate: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n" },
  { id: "go", label: "Go", monacoLang: "go", boilerplate: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println()\n}\n" },
];

interface TestCaseResult {
  caseNumber: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  compileOutput: string;
  passed: boolean;
  status: string;
  executionTime: string;
  memory: string;
}

interface SubmissionRecord {
  _id: string;
  status: string;
  language: string;
  executionTime: number;
  memoryUsed: number;
  testcasesPassed: number;
  totalTestcases: number;
  submittedAt: string;
}

function statusColor(status: string) {
  switch (status) {
    case "accepted": case "passed": return "text-emerald-500";
    case "wrong_answer": return "text-red-500";
    case "time_limit": return "text-amber-500";
    case "runtime_error": case "compilation_error": return "text-red-400";
    default: return "text-gray-400";
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "accepted": case "passed": return <CheckCircle2 size={16} className="text-emerald-500" />;
    case "wrong_answer": return <XCircle size={16} className="text-red-500" />;
    case "time_limit": return <Clock size={16} className="text-amber-500" />;
    case "runtime_error": case "compilation_error": return <AlertTriangle size={16} className="text-red-400" />;
    default: return <Terminal size={16} className="text-gray-400" />;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "accepted": return "Accepted";
    case "passed": return "Passed";
    case "wrong_answer": return "Wrong Answer";
    case "time_limit": return "Time Limit Exceeded";
    case "runtime_error": return "Runtime Error";
    case "compilation_error": return "Compilation Error";
    default: return status;
  }
}

export default function ProblemSolvePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const battleId = searchParams.get("battleId");

  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].boilerplate);
  const [user, setUser] = useState<any>(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Run / Submit state
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"testcases" | "results" | "history">("testcases");
  const [runResults, setRunResults] = useState<TestCaseResult[] | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  // Fetch user
  useEffect(() => {
    api.get("/auth/profile").then(r => setUser(r.data.data.user)).catch(() => {});
  }, []);

  // Fetch problem
  useEffect(() => {
    if (!id) return;
    api.get(`/problem/${id}`).then(r => {
      setProblem(r.data.data.problem);
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, [id]);

  // Fetch submission history
  useEffect(() => {
    if (!id || !user) return;
    api.get(`/submissions/mine?problemId=${id}&limit=15`).then(r => {
      setSubmissions(r.data.data.submissions || []);
    }).catch(() => {});
  }, [id, user, submitResult]);

  // Socket for battle mode
  useEffect(() => {
    if (battleId && user) {
      socket.connect();
      socket.emit("join_battle", { battleId, user });
    }
  }, [battleId, user]);

  // Language change
  const handleLanguageChange = (lang: typeof LANGUAGES[0]) => {
    setSelectedLang(lang);
    setCode(lang.boilerplate);
    setLangDropdownOpen(false);
  };

  // Run — sample test cases only
  const handleRun = async () => {
    if (!code.trim() || running) return;
    setRunning(true);
    setRunResults(null);
    setActiveTab("results");
    try {
      const res = await api.post("/submissions/run", {
        problemId: id,
        code,
        language: selectedLang.id,
      });
      setRunResults(res.data.data.caseResults);
    } catch (err: any) {
      setRunResults([{
        caseNumber: 0,
        input: "",
        expectedOutput: "",
        actualOutput: err.response?.data?.message || "Execution failed",
        stderr: "",
        compileOutput: "",
        passed: false,
        status: "runtime_error",
        executionTime: "N/A",
        memory: "N/A",
      }]);
    } finally {
      setRunning(false);
    }
  };

  // Submit — all test cases
  const handleSubmit = async () => {
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setSubmitResult(null);
    setActiveTab("results");
    try {
      const endpoint = battleId ? `/battles/${battleId}/submit` : "/submissions/submit";
      const res = await api.post(endpoint, {
        problemId: id,
        code,
        language: selectedLang.id,
      });
      const sub = res.data.data.submission;
      setSubmitResult(sub);

      if (battleId && sub.status === "accepted") {
        socket.emit("update_progress", { battleId, userId: user._id, progress: 100 });
        socket.emit("battle_submission", { battleId, userId: user._id, submission: sub });
      }
    } catch (err: any) {
      setSubmitResult({ status: "runtime_error", error: err.response?.data?.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-indigo-400 animate-spin" />
          <p className="text-gray-500 font-mono text-sm">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <p className="text-red-400 font-mono">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Top Bar */}
      <div className="bg-[#252526] border-b border-[#333] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-1.5 hover:bg-[#333] rounded-lg transition">
            <ChevronLeft size={18} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 52 57" fill="none">
              <path d="M6.77761 46.4769C6.09812 46.4769 5.46719 46.8698 5.10949 47.5153L1.76846 53.5442C0.959318 55.0046 1.90012 56.8904 3.43755 56.8904H34.8932C35.5973 56.8904 36.2483 56.4687 36.5977 55.7857L41.3577 46.4769H6.77761Z" fill="#6266F0" />
              <path d="M29.3507 21.7963C28.9923 22.4827 28.9937 23.3322 29.3555 24.0165L41.2354 46.4769H49.9669C51.4747 46.4765 52.4188 44.6552 51.6685 43.1938L35.065 10.8497L29.3507 21.7963Z" fill="#ccc" />
              <path d="M1.96515 10.9615C0.466978 10.9617 -0.478683 12.762 0.252002 14.2233L16.4014 46.5106L21.3013 35.564C21.5883 34.9223 21.5762 34.1643 21.2687 33.5344L10.2492 10.9615H1.96515Z" fill="#ccc" />
              <path d="M16.7209 0C16.0029 0 15.342 0.438091 14.9981 1.14218L10.2036 10.9615H45.6949C46.4129 10.9615 47.0738 10.5234 47.4177 9.81936L50.6293 3.24243C51.3425 1.78167 50.3958 0.000326679 48.9066 0H16.7209Z" fill="#6266F0" />
            </svg>
            <span className="text-gray-300 font-bold text-sm tracking-tight">
              {problem.problemNumber}. {problem.title}
            </span>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            problem.difficulty === "Easy" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" :
            problem.difficulty === "Medium" ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" :
            "text-red-400 bg-red-500/10 border border-red-500/20"
          }`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 bg-[#333] rounded-lg">
              <img src={user.profilePicture || "/profile.png"} alt="" className="w-6 h-6 rounded-full" />
              <span className="text-gray-400 text-xs font-medium">{user.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Description */}
        <div className="w-[45%] bg-[#1e1e1e] border-r border-[#333] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {problem.tags?.map((tag: any) => (
                <span key={tag.name} className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-[#2d2d30] border border-[#3e3e42]">
                  {tag.name}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {problem.description}
            </div>

            {/* Input/Output Format */}
            <div className="space-y-4">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Input Format</h3>
                <div className="bg-[#252526] border border-[#333] rounded-xl p-4 text-gray-300 text-sm font-mono">
                  {problem.inputFormat}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Output Format</h3>
                <div className="bg-[#252526] border border-[#333] rounded-xl p-4 text-gray-300 text-sm font-mono">
                  {problem.outputFormat}
                </div>
              </div>
            </div>

            {/* Sample Test Cases */}
            {problem.testCases && (
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Sample Test Cases</h3>
                {problem.testCases.slice(0, 2).map((tc: any, i: number) => (
                  <div key={i} className="bg-[#252526] border border-[#333] rounded-xl p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Input</span>
                      <pre className="mt-1 bg-[#1e1e1e] rounded-lg p-3 text-emerald-400 text-sm font-mono overflow-x-auto">{tc.input}</pre>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Output</span>
                      <pre className="mt-1 bg-[#1e1e1e] rounded-lg p-3 text-indigo-400 text-sm font-mono overflow-x-auto">{tc.output}</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            {problem.stats && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#252526] border border-[#333] rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-gray-200">{problem.stats.totalSubmissions || 0}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Submissions</p>
                </div>
                <div className="bg-[#252526] border border-[#333] rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-emerald-400">{problem.stats.successRate || 0}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Success Rate</p>
                </div>
                <div className="bg-[#252526] border border-[#333] rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-gray-200">{problem.stats.averageTime || 0}ms</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Avg Time</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor + Results */}
        <div className="w-[55%] flex flex-col">
          {/* Editor Header */}
          <div className="bg-[#252526] border-b border-[#333] px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <FileCode size={16} className="text-indigo-400" />
              <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Code</span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#333] hover:bg-[#3e3e42] rounded-lg text-sm text-gray-300 font-medium transition"
              >
                {selectedLang.label}
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[#2d2d30] border border-[#333] rounded-xl shadow-2xl py-1 z-50 min-w-[150px]">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#3e3e42] transition ${
                        selectedLang.id === lang.id ? "text-indigo-400 font-bold" : "text-gray-300"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={selectedLang.monacoLang}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderWhitespace: "selection",
                bracketPairColorization: { enabled: true },
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
              }}
            />
          </div>

          {/* Results Panel */}
          <div className="h-[35%] min-h-[200px] bg-[#252526] border-t border-[#333] flex flex-col flex-shrink-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-[#333]">
              {(["testcases", "results", "history"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                    activeTab === tab
                      ? "bg-[#333] text-gray-200"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab === "testcases" ? "Test Cases" : tab === "results" ? "Results" : "History"}
                </button>
              ))}

              {/* Run / Submit buttons on right */}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleRun}
                  disabled={running || !code.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#333] hover:bg-[#3e3e42] text-gray-200 rounded-lg text-xs font-bold transition disabled:opacity-40"
                >
                  {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !code.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-40"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Test Cases Tab */}
              {activeTab === "testcases" && problem.testCases && (
                <div className="space-y-3">
                  {problem.testCases.slice(0, 2).map((tc: any, i: number) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Case {i + 1} Input</span>
                        <pre className="mt-1 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 text-gray-300 text-xs font-mono">{tc.input}</pre>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Expected Output</span>
                        <pre className="mt-1 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 text-gray-300 text-xs font-mono">{tc.output}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results Tab */}
              {activeTab === "results" && (
                <div className="space-y-3">
                  {(running || submitting) && (
                    <div className="flex items-center justify-center py-8 gap-3">
                      <Loader2 size={20} className="text-indigo-400 animate-spin" />
                      <span className="text-gray-400 text-sm font-medium">
                        {running ? "Running against sample cases..." : "Submitting against all test cases..."}
                      </span>
                    </div>
                  )}

                  {/* Run Results */}
                  {!running && runResults && !submitResult && (
                    <>
                      <div className="flex items-center gap-3 mb-3">
                        {runResults.every(r => r.passed) ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 size={20} />
                            <span className="font-bold text-sm">All Sample Cases Passed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400">
                            <XCircle size={20} />
                            <span className="font-bold text-sm">
                              {runResults.filter(r => r.passed).length}/{runResults.length} Passed
                            </span>
                          </div>
                        )}
                      </div>
                      {runResults.map((r, i) => (
                        <div key={i} className={`bg-[#1e1e1e] border rounded-xl p-4 ${r.passed ? "border-emerald-500/20" : "border-red-500/20"}`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {r.passed ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-500" />}
                              <span className={`font-bold text-sm ${r.passed ? "text-emerald-400" : "text-red-400"}`}>
                                Case {r.caseNumber || i + 1}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500">
                              <span className="flex items-center gap-1"><Clock size={11} />{r.executionTime}</span>
                              <span className="flex items-center gap-1"><Cpu size={11} />{r.memory}</span>
                            </div>
                          </div>
                          {!r.passed && (
                            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                              <div>
                                <span className="text-[10px] font-bold uppercase text-gray-500">Expected</span>
                                <pre className="mt-1 bg-[#252526] rounded-lg p-2 text-emerald-400 overflow-x-auto">{r.expectedOutput}</pre>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase text-gray-500">Your Output</span>
                                <pre className="mt-1 bg-[#252526] rounded-lg p-2 text-red-400 overflow-x-auto">{r.actualOutput || "(empty)"}</pre>
                              </div>
                              {r.stderr && (
                                <div className="col-span-2">
                                  <span className="text-[10px] font-bold uppercase text-red-500">Error</span>
                                  <pre className="mt-1 bg-[#252526] rounded-lg p-2 text-red-300 overflow-x-auto text-[11px]">{r.stderr}</pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}

                  {/* Submit Result */}
                  {!submitting && submitResult && (
                    <div className={`bg-[#1e1e1e] border rounded-xl p-6 ${submitResult.status === "accepted" ? "border-emerald-500/20" : "border-red-500/20"}`}>
                      <div className="flex items-center gap-3 mb-4">
                        {statusIcon(submitResult.status)}
                        <span className={`font-black text-lg ${statusColor(submitResult.status)}`}>
                          {statusLabel(submitResult.status)}
                        </span>
                      </div>
                      {submitResult.testcasesPassed !== undefined && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-[#252526] rounded-lg p-3 text-center">
                            <p className="text-lg font-black text-gray-200">{submitResult.testcasesPassed}/{submitResult.totalTestcases}</p>
                            <p className="text-[10px] font-bold uppercase text-gray-500">Cases Passed</p>
                          </div>
                          <div className="bg-[#252526] rounded-lg p-3 text-center">
                            <p className="text-lg font-black text-gray-200">{submitResult.executionTime}ms</p>
                            <p className="text-[10px] font-bold uppercase text-gray-500">Runtime</p>
                          </div>
                          <div className="bg-[#252526] rounded-lg p-3 text-center">
                            <p className="text-lg font-black text-gray-200">{submitResult.memoryUsed} KB</p>
                            <p className="text-[10px] font-bold uppercase text-gray-500">Memory</p>
                          </div>
                        </div>
                      )}
                      {submitResult.error && (
                        <p className="text-red-400 text-sm mt-3">{submitResult.error}</p>
                      )}
                    </div>
                  )}

                  {!running && !submitting && !runResults && !submitResult && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Terminal size={32} className="mb-3 opacity-30" />
                      <p className="text-sm font-medium">Click Run or Submit to see results</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="space-y-2">
                  {submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <History size={32} className="mb-3 opacity-30" />
                      <p className="text-sm font-medium">No submissions yet</p>
                    </div>
                  ) : (
                    submissions.map(sub => (
                      <div key={sub._id} className="flex items-center justify-between bg-[#1e1e1e] border border-[#333] rounded-xl px-4 py-3 hover:border-[#444] transition">
                        <div className="flex items-center gap-3">
                          {statusIcon(sub.status)}
                          <div>
                            <span className={`font-bold text-sm ${statusColor(sub.status)}`}>{statusLabel(sub.status)}</span>
                            <p className="text-[11px] text-gray-500">{sub.language} • {sub.testcasesPassed}/{sub.totalTestcases} passed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{sub.executionTime}ms • {sub.memoryUsed} KB</p>
                          <p className="text-[10px] text-gray-600">{new Date(sub.submittedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
