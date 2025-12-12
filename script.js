// Cek apakah ada API Key tersimpan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('rfh_gemini_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
        document.getElementById('apiKey').style.borderColor = '#4ade80'; 
    }
});

async function generatePrompt() {
    // 1. PENGATURAN API KEY & MODEL
    const apiKey = document.getElementById('apiKey').value.trim();
    
    // --- PILIHAN MODEL AI ---
    // Gunakan 'gemini-1.5-flash' untuk versi stabil & cepat.
    // Gunakan 'gemini-2.0-flash-exp' jika ingin mencoba fitur experimental terbaru.
    // Catatan: 'gemini-2.5-flash' BELUM ADA, jangan digunakan nanti error.
    
    const selectedModel = 'gemini-2.5-flash'; 

    // Validasi API Key
    if (!apiKey) {
        alert("⚠️ Mohon masukkan API Key Gemini Anda terlebih dahulu.");
        document.getElementById('apiKey').focus();
        return;
    }

    localStorage.setItem('rfh_gemini_api_key', apiKey);

    // 2. Ambil Input User
    const inputs = {
        character: document.getElementById('charDesc').value || "-",
        setting: document.getElementById('setting').value || "-",
        action: document.getElementById('action').value || "-",
        dialog: document.getElementById('dialog').value || "-",
        style: document.getElementById('visualStyle').value,
        angle: document.getElementById('cameraAngle').value,
        move: document.getElementById('cameraMove').value,
        lighting: document.getElementById('lighting').value,
        ratio: document.getElementById('aspectRatio').value,
        mood: document.getElementById('mood').value,
    };

    // 3. Setup Tampilan Loading
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const output = document.getElementById('outputResult');
    
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    btnText.innerText = "GEMINI SEDANG MENULIS...";
    btnIcon.classList.remove('fa-robot');
    btnIcon.classList.add('fa-spinner', 'fa-spin');
    output.innerText = "Sedang menghubungi server Gemini (" + selectedModel + ")...";

    // 4. INSTRUKSI PROMPT (Bahasa Indonesia & Naratif)
    const systemPrompt = `
        Peran: Kamu adalah Prompt Engineer Video Profesional.
        Tugas: Buatkan deskripsi visual video (Scene Description) dalam BAHASA INDONESIA berdasarkan data berikut.
        
        DATA INPUT:
        - Karakter: ${inputs.character}
        - Lokasi: ${inputs.setting}
        - Aktivitas: ${inputs.action}
        - Dialog/Inti Bicara: ${inputs.dialog}
        - Gaya Visual: ${inputs.style}
        - Sudut Kamera: ${inputs.angle}, Pergerakan: ${inputs.move}
        - Pencahayaan: ${inputs.lighting}
        - Suasana (Mood): ${inputs.mood}

        ATURAN OUTPUT:
        1. JANGAN pakai format JSON. Gunakan format teks paragraf biasa.
        2. Tuliskan deskripsi yang sangat detail, membayangkan bagaimana video itu terlihat di layar.
        3. Jelaskan ekspresi wajah, detail tekstur, dan pencahayaan.
        4. Gunakan Bahasa Indonesia yang luwes dan enak dibaca.
        5. Akhiri dengan satu kalimat pendek "Prompt Inggris (untuk AI):" lalu terjemahkan intinya ke bahasa Inggris dalam kurung (supaya user bisa pakai di tools luar jika perlu).
    `;

    // 5. Eksekusi ke Server Google
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        // Cek Error
        if (data.error) throw new Error(data.error.message);

        // Ambil Hasil Text
        let rawText = data.candidates[0].content.parts[0].text;
        
        // Tampilkan Hasil
        output.innerText = rawText;

    } catch (error) {
        console.error(error);
        output.innerText = "❌ Terjadi Kesalahan:\n" + error.message;
        
        if (error.message.includes('not found') || error.message.includes('404')) {
             output.innerText += "\n\n(Kemungkinan nama Model AI salah atau belum tersedia)";
        }
        
        if (error.message.includes('API key') || error.message.includes('403')) {
            localStorage.removeItem('rfh_gemini_api_key');
            alert("API Key bermasalah/kadaluarsa. Silakan cek ulang.");
        }
    } finally {
        // 6. Kembalikan Tombol
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btnText.innerText = "GENERATE PROMPT VIDEO";
        btnIcon.classList.remove('fa-spinner', 'fa-spin');
        btnIcon.classList.add('fa-robot');
    }
}

function copyToClipboard() {
    const copyText = document.getElementById("outputResult").innerText;
    navigator.clipboard.writeText(copyText).then(() => alert("✅ Teks berhasil disalin!"));
}
