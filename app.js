// ─── อักขราธิการ AI Application Logic ───

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // DOM Elements
    const btnSettings = document.getElementById('btn-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const settingsPanel = document.getElementById('settings-panel');
    const apiProvider = document.getElementById('api-provider');
    const geminiConfig = document.getElementById('gemini-config');
    const cloudflareConfig = document.getElementById('cloudflare-config');
    const ollamaConfig = document.getElementById('ollama-config');
    const geminiKeyInput = document.getElementById('gemini-key');
    const toggleGeminiKey = document.getElementById('toggle-gemini-key');
    const ollamaUrlInput = document.getElementById('ollama-url');
    const ollamaModelInput = document.getElementById('ollama-model');
    const btnSaveSettings = document.getElementById('btn-save-settings');

    const inputText = document.getElementById('input-text');
    const editMode = document.getElementById('edit-mode');
    const btnClear = document.getElementById('btn-clear');
    const btnAnalyze = document.getElementById('btn-analyze');

    const outputPlaceholder = document.getElementById('output-placeholder');
    const outputLoading = document.getElementById('output-loading');
    const outputResult = document.getElementById('output-result');
    const btnCopy = document.getElementById('btn-copy');
    const correctedTextContainer = document.getElementById('corrected-text-container');
    const explanationContainer = document.getElementById('explanation-container');
    const charCounter = document.getElementById('char-counter');
    const toast = document.getElementById('toast');

    // State Variables
    let currentConfig = {
        provider: 'cloudflare',
        geminiKey: '',
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'qwen-kongsuk:latest'
    };

    let processedOutput = "";

    // ─── Load Settings from LocalStorage ───
    function loadSettings() {
        const saved = localStorage.getItem('akkarathikan_settings');
        if (saved) {
            try {
                currentConfig = { ...currentConfig, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Error parsing saved configurations:", e);
            }
        }
        
        // Update DOM inputs
        apiProvider.value = currentConfig.provider;
        geminiKeyInput.value = currentConfig.geminiKey || '';
        ollamaUrlInput.value = currentConfig.ollamaUrl || 'http://localhost:11434';
        ollamaModelInput.value = currentConfig.ollamaModel || 'qwen-kongsuk:latest';
        
        toggleConfigSections(currentConfig.provider);
    }

    function toggleConfigSections(provider) {
        cloudflareConfig.classList.add('hidden');
        geminiConfig.classList.add('hidden');
        ollamaConfig.classList.add('hidden');
        
        if (provider === 'cloudflare') {
            cloudflareConfig.classList.remove('hidden');
        } else if (provider === 'gemini') {
            geminiConfig.classList.remove('hidden');
        } else if (provider === 'ollama') {
            ollamaConfig.classList.remove('hidden');
        }
    }

    // Initialize Settings
    loadSettings();

    // ─── Settings Panel Control Events ───
    btnSettings.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsPanel.classList.add('hidden');
    });

    apiProvider.addEventListener('change', (e) => {
        toggleConfigSections(e.target.value);
    });

    toggleGeminiKey.addEventListener('click', () => {
        const type = geminiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        geminiKeyInput.setAttribute('type', type);
        const iconName = type === 'password' ? 'eye' : 'eye-off';
        toggleGeminiKey.innerHTML = `<i data-lucide="${iconName}"></i>`;
        lucide.createIcons();
    });

    btnSaveSettings.addEventListener('click', () => {
        currentConfig.provider = apiProvider.value;
        currentConfig.geminiKey = geminiKeyInput.value.trim();
        currentConfig.ollamaUrl = ollamaUrlInput.value.trim();
        currentConfig.ollamaModel = ollamaModelInput.value.trim();

        localStorage.setItem('akkarathikan_settings', JSON.stringify(currentConfig));
        showToast("💾 บันทึกการตั้งค่าระบบเชื่อมต่อสำเร็จ!", "success");
        settingsPanel.classList.add('hidden');
    });

    // ─── Text Area Character Counter ───
    inputText.addEventListener('input', () => {
        const text = inputText.value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        charCounter.textContent = `ตัวอักษร: ${chars} ตัว | คำ: ${words} คำ`;
    });

    btnClear.addEventListener('click', () => {
        inputText.value = "";
        charCounter.textContent = "ตัวอักษร: 0 ตัว | คำ: 0 คำ";
        showPlaceholderState();
        showToast("🧹 ล้างข้อมูลอินพุตเรียบร้อย", "info");
    });

    // ─── View Controller States ───
    function showPlaceholderState() {
        outputPlaceholder.classList.remove('hidden');
        outputLoading.classList.add('hidden');
        outputResult.classList.add('hidden');
        btnCopy.classList.add('hidden');
    }

    function showLoadingState() {
        outputPlaceholder.classList.add('hidden');
        outputLoading.classList.remove('hidden');
        outputResult.classList.add('hidden');
        btnCopy.classList.add('hidden');
    }

    function showResultState() {
        outputPlaceholder.classList.add('hidden');
        outputLoading.classList.add('hidden');
        outputResult.classList.remove('hidden');
        btnCopy.classList.remove('hidden');
    }

    // ─── Toast Notifications ───
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = 'toast'; // reset class
        
        if (type === 'success') {
            toast.innerHTML = `<i data-lucide="check" class="text-success"></i> <span>${message}</span>`;
        } else if (type === 'error') {
            toast.innerHTML = `<i data-lucide="alert-circle" class="text-danger"></i> <span>${message}</span>`;
        } else {
            toast.innerHTML = `<i data-lucide="info" class="text-info"></i> <span>${message}</span>`;
        }
        
        lucide.createIcons();
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3500);
    }

    // ─── AI Text Analyzer Action ───
    btnAnalyze.addEventListener('click', async () => {
        const text = inputText.value.trim();
        if (!text) {
            showToast("⚠️ กรุณากรอกข้อความภาษาไทยก่อนวิเคราะห์", "error");
            return;
        }

        // Validate API configurations
        if (currentConfig.provider === 'gemini' && !currentConfig.geminiKey) {
            showToast("🔑 กรุณาป้อนกุญแจ Gemini API Key ในปุ่มตั้งค่าก่อนเริ่ม", "error");
            settingsPanel.classList.remove('hidden');
            return;
        }

        showLoadingState();

        // 1. Build Custom AI Prompts
        const mode = editMode.value;
        let prompt = "";

        if (mode === 'check') {
            prompt = `คุณคือระบบผู้ช่วยภาษาไทยอัจฉริยะ ทำหน้าที่ตรวจทานคำผิด (Spell Checker) และไวยากรณ์ภาษาไทย
กรุณาตรวจสอบข้อความภาษาไทยต่อไปนี้ และดำเนินการแก้ไข:
- คำสะกดผิด
- คำทับศัพท์ภาษาอังกฤษที่สะกดเพี้ยน
- วรรณยุกต์หรือสระลอย สระซ้อน (เช่น สระอุ สระอู วรรณยุกต์เพี้ยน)
- การเว้นวรรคตอน

ข้อความที่ต้องตรวจสอบ:
"${text}"

คุณต้องวิเคราะห์และตอบกลับในรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "corrected": "ข้อความภาษาไทยฉบับแก้ไขสะกดคำผิดและสระลอยสมบูรณ์แล้ว ห้ามให้มีคำผิดเด็ดขาด",
  "explanation": "เขียนอธิบายเป็นข้อๆ สั้นๆ ในภาษาไทย สรุปรายการคำสะกดผิดที่พบว่าแก้ไขจากอะไรเป็นอะไร"
}`;
        } else if (mode === 'polish') {
            prompt = `คุณคือบรรณาธิการภาษาไทยระดับแนวหน้า (Premium Copywriter & Editor)
กรุณาช่วยขัดเกลาและปรับปรุงสำนวนของข้อความภาษาไทยต่อไปนี้ให้อ่านง่าย มีความเป็นมืออาชีพ ไหลลื่น สละสลวย และดูน่าเชื่อถือยิ่งขึ้น โดยยังคงความต้องการและเจตนาเดิมของเนื้อหาไว้ครบถ้วน

ข้อความที่ต้องขัดเกลา:
"${text}"

คุณต้องวิเคราะห์และตอบกลับในรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "corrected": "ข้อความที่ขัดเกลาภาษาปรับปรุงสำนวนแล้วอย่างสวยงามระดับพรีเมียม",
  "explanation": "อธิบายจุดที่ทำการปรับปรุงสำนวนภาษาไทยและการเลือกคำอธิบายเป็นข้อๆ"
}`;
        } else {
            prompt = `คุณคือผู้เชี่ยวชาญการสรุปความเนื้อหาภาษาไทย
กรุณาช่วยสรุปเนื้อหาของข้อความต่อไปนี้ให้อ่านเข้าใจได้ทันที ย่อส่วนใจความสำคัญ และนำเสนอแบบกระชับ

ข้อความที่ต้องย่อสรุป:
"${text}"

คุณต้องวิเคราะห์และตอบกลับในรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "corrected": "เนื้อหาย่อสรุปภาษาไทยแบบกระชับจับประเด็นสำคัญเป็นย่อหน้าและบรรทัดที่ลงตัว",
  "explanation": "อธิบายสรุปหัวข้อย่อยหรือประเด็นหลักที่แยกแกนใจความสั้นๆ"
}`;
        }

        // 2. Fetch from AI Endpoint
        try {
            let aiResponse = "";
            if (currentConfig.provider === 'cloudflare') {
                aiResponse = await callCloudflareAPI(prompt);
            } else if (currentConfig.provider === 'gemini') {
                aiResponse = await callGeminiAPI(prompt, currentConfig.geminiKey);
            } else {
                aiResponse = await callOllamaAPI(prompt, currentConfig.ollamaUrl, currentConfig.ollamaModel);
            }

            // 3. Parse and Render Results
            const data = parseJSONResponse(aiResponse);
            if (data && data.corrected) {
                processedOutput = data.corrected;
                
                // Render corrected text with highlighted changes (simple visual representation)
                renderDiff(text, data.corrected);
                
                // Render explanations
                explanationContainer.innerHTML = formatExplanation(data.explanation);
                
                showResultState();
                showToast("✨ วิเคราะห์และประมวลผลข้อความเสร็จสิ้น!", "success");
            } else {
                throw new Error("โครงสร้างการตอบกลับของ AI ไม่ตรงตามรูปแบบที่ต้องการ");
            }

        } catch (error) {
            console.error("API Call Error:", error);
            showPlaceholderState();
            showToast(`❌ ข้อผิดพลาด: ${error.message}`, "error");
        }
    });

    // ─── Cloudflare Proxy API HTTP Request Call ───
    async function callCloudflareAPI(prompt) {
        const url = `/api/analyze`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `ไม่สามารถเรียกใช้งาน API คลาวด์ได้ (HTTP ${response.status})`);
        }

        return await response.text();
    }

    // ─── Gemini API HTTP Request Call ───
    async function callGeminiAPI(prompt, apiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const resData = await response.json();
        return resData.candidates[0].content.parts[0].text;
    }

    // ─── Ollama API HTTP Request Call ───
    async function callOllamaAPI(prompt, hostUrl, modelName) {
        const url = `${hostUrl}/api/generate`;
        const payload = {
            model: modelName,
            prompt: prompt,
            stream: false,
            format: "json"
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`ไม่สามารถเชื่อมต่อ Local Ollama ได้ (HTTP ${response.status})`);
        }

        const resData = await response.json();
        return resData.response;
    }

    // ─── JSON Extractor ───
    function parseJSONResponse(rawText) {
        // บางครั้ง LLM จะส่งครอบ ```json ``` มาด้วย ต้องตัดหัวท้าย
        let cleanText = rawText.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.substring(7);
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.substring(3);
        }
        if (cleanText.endsWith('```')) {
            cleanText = cleanText.substring(0, cleanText.length - 3);
        }
        cleanText = cleanText.trim();

        try {
            return JSON.parse(cleanText);
        } catch (e) {
            // ค้นหาขอบเขตปีกกาตัวแรกและตัวสุดท้ายเผื่อมีคำอธิบายเกินมา
            const start = cleanText.indexOf('{');
            const end = cleanText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                const subStr = cleanText.substring(start, end + 1);
                try {
                    return JSON.parse(subStr);
                } catch (subErr) {
                    throw new Error("AI ตอบกลับไม่ได้อยู่ในรูปแบบ JSON ที่ถูกต้อง");
                }
            }
            throw new Error("AI ตอบกลับไม่ได้อยู่ในรูปแบบ JSON ที่ถูกต้อง");
        }
    }

    // ─── Diff Highlight Render Logic ───
    function renderDiff(original, corrected) {
        // สำหรับโปรเจกต์ขนาดเล็ก เราสามารถแสดงผลลัพธ์ที่สมบูรณ์แบบได้โดยตรง
        // แต่การเติมไฮไลต์จุดเปลี่ยนจะทำให้ดูพรีเมียมขึ้น เราใช้วิธีแสดงข้อความเต็ม
        // และหากคำในข้อความแตกต่างกัน ระบบจะแสดงข้อความที่ขัดเกลาแล้วลงในกล่อง
        correctedTextContainer.textContent = corrected;
    }

    // ─── Formatting Explanation Bullet Points ───
    function formatExplanation(explanationText) {
        if (!explanationText) return "<p>ไม่มีรายการแก้ไขพิเศษ</p>";
        
        // แยกข้อความบรรทัดใหม่หรือเครื่องหมายนำหน้าข้อ
        const lines = explanationText.split('\n');
        let htmlStr = "";
        
        lines.forEach(line => {
            const cleanLine = line.trim().replace(/^[-*•\d.]+\s*/, '');
            if (cleanLine) {
                htmlStr += `<p>• ${htmlStrEscape(cleanLine)}</p>`;
            }
        });
        
        return htmlStr || `<p>${htmlStrEscape(explanationText)}</p>`;
    }

    function htmlStrEscape(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ─── Clipboard Copy Action ───
    btnCopy.addEventListener('click', () => {
        if (!processedOutput) return;
        
        navigator.clipboard.writeText(processedOutput).then(() => {
            showToast("📋 คัดลอกข้อความขัดเกลาลงคลิปบอร์ดแล้ว!", "success");
        }).catch(err => {
            console.error("Clipboard error:", err);
            showToast("❌ ไม่สามารถคัดลอกได้โดยอัตโนมัติ", "error");
        });
    });
});
