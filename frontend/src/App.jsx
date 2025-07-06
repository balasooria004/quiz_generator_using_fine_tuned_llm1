import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  BookOpen,
  PenTool,
  MessageSquare,
  Trophy,
  Loader2,
} from "lucide-react";

function App() {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("quiz");
  const [quizScore, setQuizScore] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileRef = useRef();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("count", 5);

      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (qIndex, selected) => {
    const updated = { ...questions };
    updated.quiz[qIndex].selected = selected;
    setQuestions(updated);

    // Calculate score
    const correct = updated.quiz.filter(
      (q) => q.selected && q.selected === q.correct
    ).length;
    setQuizScore(correct);
  };

  const getScoreColor = () => {
    const percentage = (quizScore / questions?.quiz?.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Study Material Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your PDFs into interactive study materials
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="space-y-6">
            <div className="text-center">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                  uploadedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <input
                  type="file"
                  ref={fileRef}
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center space-y-4">
                  {uploadedFile ? (
                    <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-green-800">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-green-600">
                          Ready to generate study materials
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PDF files up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={loading || !uploadedFile}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Study Materials
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center justify-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {questions && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === "quiz"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>Quiz</span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor()} bg-gray-100`}
                    >
                      {quizScore}/{questions.quiz.length}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("short")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === "short"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Short Answers</span>
                    <div className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      {questions.short_answers.length}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("long")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === "long"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PenTool className="w-4 h-4" />
                    <span>Long Answers</span>
                    <div className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      {questions.long_answers.length}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Quiz Tab */}
              {activeTab === "quiz" && (
                <div className="space-y-6">
                  {questions.quiz.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mr-3">
                          {qIndex + 1}
                        </span>
                        {q.question}
                      </h3>
                      <div className="grid gap-3">
                        {["A", "B", "C", "D"].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => handleQuizAnswer(qIndex, opt)}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                              q.selected === opt
                                ? opt === q.correct
                                  ? "bg-green-100 border-green-500 shadow-lg scale-105"
                                  : "bg-red-100 border-red-500 shadow-lg scale-105"
                                : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-sm font-bold mr-3">
                                  {opt}
                                </span>
                                {q.options[["A", "B", "C", "D"].indexOf(opt)]}
                              </span>
                              {q.selected === opt && (
                                <span className="flex items-center space-x-1">
                                  {opt === q.correct ? (
                                    <>
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="text-green-600 font-medium">
                                        Correct
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-5 h-5 text-red-600" />
                                      <span className="text-red-600 font-medium">
                                        Incorrect
                                      </span>
                                    </>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answers Tab */}
              {activeTab === "short" && (
                <div className="space-y-6">
                  {questions.short_answers.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-gray-200"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold mr-3">
                          {qIndex + 1}
                        </span>
                        {q.question}
                      </h3>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-700 leading-relaxed">
                          {q.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Long Answers Tab */}
              {activeTab === "long" && (
                <div className="space-y-6">
                  {questions.long_answers.map((q, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-gray-200"
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mr-3">
                          {qIndex + 1}
                        </span>
                        {q.question}
                      </h3>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {q.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
