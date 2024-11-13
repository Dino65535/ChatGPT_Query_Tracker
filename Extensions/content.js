// 初始化聊天紀錄 URL
let currentUrl = window.location.href;
// 用來記錄已經抓取過的問題
let previousQuestions = new Set();
// 紀錄滾輪位置
let scrollPosition = 0
// 設定問題最大顯示長度
const maxLength = 15;
// 視窗初始狀態為展開
let isExpanded = true; 

// 判斷聊天紀錄網址
const isChatPage = (url) => {
    const chatRecordRegex = /^https:\/\/chatgpt\.com\/c\/[a-z0-9-]+$/; // 特定聊天紀錄
    const tempChatRegex = /^https:\/\/chatgpt\.com\/\?temporary-chat=true$/; // 臨時聊天
    return chatRecordRegex.test(url) || tempChatRegex.test(url);
};

// 建立視窗
const createFloatingPanel = () => {
    if (document.getElementById("gpt-extension-panel")) return; // 檢查是否已經有浮動視窗

    const panel = document.createElement("div");
    panel.id = "gpt-extension-panel";
    panel.style.position = "fixed";
    panel.style.top = "59px";
    panel.style.right = "15px";
    panel.style.backgroundColor = "white";  // 保持背景顏色為白色
    panel.style.border = "1px solid #ccc";  // 保持邊框顏色為灰色
    panel.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";  // 保持陰影效果
    panel.style.transition = "all 0.3s ease";  // 增加過渡效果，當改變大小時平滑過渡

    // 創建 header
    const header = document.createElement("h1");
    panel.appendChild(header);
    // 設置標題文字的樣式
    //header.style.textAlign = "center";  // 文字水平置中
    header.style.position = "relative";
    header.style.left = "82px"; // 往右移動 像素
    header.style.fontSize = "18px";  // 設定字體大小
    header.style.color = "#333";  // 設定字體顏色
    header.style.margin = "10px 0";  // 設定上下邊距

    // 顯示問題的容器
    const questionContainer = document.createElement("div");
    questionContainer.id = "question-container";
    questionContainer.style.padding = "10px";
    questionContainer.style.height = "330px"; // 設定容器高度
    questionContainer.style.overflowY = "auto"; // 啟用垂直滾動
    panel.appendChild(questionContainer);

    // 創建切換按鈕
    const toggleButton = document.createElement("button");
    panel.appendChild(toggleButton);
    toggleButton.style.position = "absolute";
    toggleButton.style.top = "5px";
    toggleButton.style.right = "5px";
    // 設置按鈕的樣式
    toggleButton.style.fontSize = "14px";  // 設定按鈕文字大小
    toggleButton.style.padding = "10px 20px";  // 設定按鈕的內邊距
    toggleButton.style.border = "none";  // 移除按鈕邊框
    toggleButton.style.backgroundColor = "#f0f0f0";  // 設定按鈕背景顏色
    toggleButton.style.cursor = "pointer";  // 設定按鈕樣式，當鼠標懸停時顯示為可點擊
    // 使用 Flexbox 讓文字水平和垂直居中
    toggleButton.style.display = "flex";
    toggleButton.style.justifyContent = "center";  // 水平居中
    toggleButton.style.alignItems = "center";  // 垂直居中
    toggleButton.style.width = "auto";  // 根據內容調整寬度
    toggleButton.style.height = "auto";  // 根據內容調整高度

    // 切換展開與縮小狀態
    toggleButton.onclick = () => {
        isExpanded = !isExpanded;
        if (!isExpanded)
            scrollPosition = questionContainer.scrollTop;

        updatePanel(panel, toggleButton, header, questionContainer); // 更新視窗
        // 使用 setTimeout 等待視窗變更後設置滾動位置
        if (isExpanded) {
            setTimeout(() => {
                questionContainer.scrollTop = 0;
                questionContainer.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            }, 300);  // 延遲執行，確保視窗已更新
        }
    };

    // 初始化視窗狀態
    updatePanel(panel, toggleButton, header, questionContainer);

    // 將面板添加到頁面中
    document.body.appendChild(panel);
};

// 更新視窗的狀態
const updatePanel = (panel, toggleButton, header, questionContainer) => {
    // 根據 isExpanded 設置大小
    panel.style.width = isExpanded ? "300px" : "80px";
    panel.style.height = isExpanded ? "400px" : "53px";
    // 當縮小時隱藏標題
    header.innerText = isExpanded ? "提問紀錄" : "";
    // 更新按鈕的文字
    toggleButton.innerText = isExpanded ? "縮小" : "展開";
    // 顯示問題
    questionContainer.style.display = isExpanded ? "block" : "none";

};

// 初次加載時執行檢查
if (isChatPage(currentUrl)) {
    createFloatingPanel();
}

// 顯示問題的函數
const displayQuestion = (questionText, questionElement) => {
    const questionContainer = document.getElementById("question-container");
    if (questionContainer) {
        const questionButton = document.createElement("button");
        questionButton.innerText = questionText;
        questionButton.style.margin = "5px 0";
        questionButton.style.width = "100%"; // 讓按鈕寬度填滿
        questionButton.style.textAlign = "left"; // 左對齊
        questionButton.onclick = () => {
            questionElement.scrollIntoView({ behavior: "smooth", block: "center" });
        };
        questionContainer.appendChild(questionButton);

        // 添加分隔線
        const separator = document.createElement("hr");
        separator.style.margin = "5px 0";  // 調整間距
        separator.style.border = "0.5px solid #ccc"; // 設定顏色和粗細
        questionContainer.appendChild(separator);
    }
};

// 函數：抓取問題內容
const fetchQuestions = () => {
    let questions = document.querySelectorAll('.whitespace-pre-wrap');
    questions.forEach((question) => {
        let questionText = question.innerText.trim();

        // 截斷過長的問題並加上 "..."
        if (questionText.length > maxLength) {
            questionText = questionText.slice(0, maxLength) + "...";
        }

        // 只抓取還沒有記錄過的問題
        if (!previousQuestions.has(questionText)) {
            //console.log(questionText); debug用
            previousQuestions.add(questionText); // 記錄已抓取的問題
            displayQuestion(questionText, question);
        }
    });
};

// 檢查並創建浮動窗口
const checkForNewChat = () => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        previousQuestions.clear();
        let questionContainer = document.getElementById("question-container");
        if (questionContainer) {
            questionContainer.innerHTML = ""; // Clear the question list safely
        }

        if (isChatPage(currentUrl)) {
            // 延遲創建浮動面板，以確保問題列表被清空
            setTimeout(() => {
                fetchQuestions();
                createFloatingPanel(); // 創建新的浮動面板並顯示問題
            }, 1000);  // 延遲一段時間（100ms）
        }
    }
    else {
        fetchQuestions();
    }
};
// 每秒檢查 URL 是否變更
setInterval(checkForNewChat, 1000);