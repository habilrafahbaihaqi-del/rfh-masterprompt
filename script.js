// Cek apakah ada API Key tersimpan saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('rfh_gemini_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
        // Visual feedback bahwa key terload
        document.getElementById('apiKey').style.borderColor = '#4ade80'; 
    }
});

async function generatePrompt() {
    // 1. Ambil API Key & Model
    const apiKey = document.getElementById('apiKey').value.trim();
    // Jika Anda belum menambahkan dropdown model di HTML, kita default ke flash
    // Jika sudah ada dropdown, uncomment baris di bawah:
    // const selectedModel = document.getElementById('aiModel') ? document.getElementById('aiModel').value : 'gemini-1.5-flash';
    const selectedModel = 'gemini-2.5-flash'; 

    // Validasi API Key
    if (!apiKey) {
        alert("⚠️ Mohon masukkan API Key Gemini Anda terlebih dahulu.");
        document.getElementById('apiKey').focus();
        return;
    }

    localStorage.setItem('rfh_gemini_api_key', apiKey);

    // 2. Ambil semua input user
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

    // 3. Setup UI Loading State
    const btn = document.getElementById('generateBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const output = document.getElementById('outputResult');
    
    btn.disabled = true;
    btn.classList.add('opacity-50', 'cursor-not-allowed');
    btnText.innerText = "SEDANG MERANGKAI KATA...";
    btnIcon.classList.remove('fa-robot');
    btnIcon.classList.add('fa-spinner', 'fa-spin');
    output.innerText = "Sedang menulis prompt video bahasa Indonesia...";

    // 4. INSTRUKSI BARU (BAHASA INDONESIA & TEXT BIASA)
    const systemPrompt = `
        Peran: Anda adalah Sutradara Video Kreatif dan Penulis Prompt AI.
        Tugas: Buatkan deskripsi video yang detail dan naratif dalam BAHASA INDONESIA berdasarkan input pengguna.
        
        INPUT PENGGUNA:
        - Karakter: ${inputs.character}
        - Latar Tempat: ${inputs.setting}
        - Aksi: ${inputs.action}
        - Dialog/Tujuan: ${inputs.dialog}
        - Gaya Visual: ${inputs.style}
        - Kamera: ${inputs.angle}, ${inputs.move}
        - Pencahayaan: ${inputs.lighting}
        - Mood: ${inputs.mood}

        INSTRUKSI KHUSUS:
        1. Jangan gunakan format JSON atau kode apapun.
        2. Tuliskan dalam bentuk paragraf deskriptif yang mengalir enak dibaca.
        3. Jelaskan secara rinci bagaimana visualnya terlihat, bagaimana pencahayaannya membangun suasana (${inputs.mood}), dan bagaimana kamera bergerak.
        4. Jika ada dialog, tuliskan dengan jelas.
        5. Gunakan Bahasa Indonesia yang kreatif dan imajinatif.
    `;

    // 5. Eksekusi Call ke Gemini API
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        let rawText = data.candidates[0].content.parts[0].text;
        
        // Tampilkan hasil langsung (Text biasa)
        output.innerText = rawText;

    } catch (error) {
        console.error(error);
        output.innerText = "❌ Terjadi Kesalahan:\n" + error.message;
        if (error.message.includes('API key') || error.message.includes('403')) {
            localStorage.removeItem('rfh_gemini_api_key');
            alert("API Key bermasalah. Silakan cek kembali.");
        }
    } finally {
        // 6. Reset UI
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btnText.innerText = "GENERATE PROMPT";
        btnIcon.classList.remove('fa-spinner', 'fa-spin');
        btnIcon.classList.add('fa-robot');
    }
}

function copyToClipboard() {
    const copyText = document.getElementById("outputResult").innerText;
    navigator.clipboard.writeText(copyText).then(() => alert("✅ Teks berhasil disalin!"));
}
