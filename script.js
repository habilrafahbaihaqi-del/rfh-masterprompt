// Cek apakah ada API Key tersimpan
document.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('rfh_gemini_api_key');
    if (savedKey) {
        document.getElementById('apiKey').value = savedKey;
        document.getElementById('apiKey').style.borderColor = '#4ade80'; 
    }
});

async function generatePrompt() {
    // 1. Setup Variabel
    const apiKey = document.getElementById('apiKey').value.trim();
    // Kita pakai model flash yang stabil
    const selectedModel = 'gemini-2.5-flash'; 

    if (!apiKey) {
        alert("⚠️ Masukkan API Key dulu bosku!");
        document.getElementById('apiKey').focus();
        return;
    }
    localStorage.setItem('rfh_gemini_api_key', apiKey);

    // Ambil Data Input
    const inputs = {
        character: document.getElementById('charDesc').value || "Tidak ada detail karakter",
        setting: document.getElementById('setting').value || "Tidak ada detail lokasi",
        action: document.getElementById('action').value || "Tidak ada detail aksi",
        dialog: document.getElementById('dialog').value || "Tidak ada dialog",
        style: document.getElementById('visualStyle').value,
        angle: document.getElementById('cameraAngle').value,
        move: document.getElementById('cameraMove').value,
        lighting: document.getElementById('lighting').value,
        mood: document.getElementById('mood').value,
    };

    // 2. Tampilan Loading
    const btn = document.getElementById('generateBtn');
    const output = document.getElementById('outputResult');
    
    btn.disabled = true;
    btn.innerText = "SEDANG MENULIS CERITA...";
    output.innerText = "Sedang merangkai deskripsi video...";

    // 3. INSTRUKSI ANTI-JSON (Strict Mode)
    const systemPrompt = `
        Tugas: Kamu adalah penulis skenario video profesional.
        Tujuan: Buatkan deskripsi visual video (prompt) dalam BAHASA INDONESIA.

        ATURAN KERAS (WAJIB PATUH):
        1. JANGAN PERNAH GUNAKAN FORMAT JSON ({...}) ATAU CODE BLOCK.
        2. Tulis output hanya sebagai TEKS BIASA (Paragraf).
        3. Gunakan Bahasa Indonesia yang deskriptif dan imajinatif.

        INFORMASI VIDEO:
        - Karakter: ${inputs.character}
        - Lokasi: ${inputs.setting}
        - Aksi: ${inputs.action}
        - Dialog: ${inputs.dialog}
        - Visual: ${inputs.style}, Pencahayaan: ${inputs.lighting}
        - Kamera: ${inputs.angle}, Gerak: ${inputs.move}
        - Mood: ${inputs.mood}

        FORMAT HASIL YANG DIINGINKAN:
        [Judul Video Singkat]
        
        [Deskripsi Visual]
        (Tuliskan paragraf detail tentang apa yang terlihat di layar...)

        [Detail Audio]
        (Jelaskan suara latar atau dialog...)
    `;

    // 4. Kirim ke Gemini
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

        // Ambil teks
        let resultText = data.candidates[0].content.parts[0].text;
        
        // PEMBERSIHAN FINAL (Jaga-jaga kalau AI masih bandel kasih markdown json)
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').replace(/{/g, '').replace(/}/g, '');

        output.innerText = resultText;

    } catch (error) {
        output.innerText = "❌ Error: " + error.message;
    } finally {
        btn.disabled = false;
        btn.innerText = "GENERATE PROMPT VIDEO";
    }
}

function copyToClipboard() {
    const copyText = document.getElementById("outputResult").innerText;
    navigator.clipboard.writeText(copyText).then(() => alert("Teks berhasil disalin!"));
}

/* --- LOGIKA NAVBAR AKTIF OTOMATIS (SCROLL SPY) --- */
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    // Cari section mana yang sedang terlihat di layar
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Angka 100 adalah jarak offset supaya deteksinya lebih akurat
        if (scrollY >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });

    // Update warna tombol navbar
    document.querySelectorAll('.nav-link').forEach(link => {
        // Hapus warna aktif (Biru) dari semua tombol
        link.classList.remove('bg-indigo-600', 'text-white');
        link.classList.add('text-gray-300');

        // Tambahkan warna aktif HANYA ke tombol yang sesuai
        if (link.getAttribute('href').includes(current)) {
            link.classList.remove('text-gray-300');
            link.classList.add('bg-indigo-600', 'text-white');
        }
    });
});
