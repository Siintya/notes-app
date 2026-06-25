const board = document.getElementById('board');
const addBtn = document.getElementById('add-btn');

// Load notes from LocalStorage on init
let notesData = JSON.parse(localStorage.getItem('saved_notes')) || [];

// Initial render
notesData.forEach(note => createNoteDOM(note));

addBtn.addEventListener('click', () => {
    const newNote = {
        id: 'note_' + Date.now(),
        content: '',
        x: Math.random() * (window.innerWidth - 300) + 20,
        y: Math.random() * (window.innerHeight - 300) + 120,
        date: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    };

    notesData.push(newNote);
    saveToStorage();
    createNoteDOM(newNote);
});

function createNoteDOM(noteObj) {
    const noteEl = document.createElement('div');
    noteEl.classList.add('note');
    noteEl.id = noteObj.id;
    noteEl.style.left = `${noteObj.x}px`;
    noteEl.style.top = `${noteObj.y}px`;

    noteEl.innerHTML = `
        <div class="note-header">
            <span class="note-date">${noteObj.date}</span>
                <button class="btn-delete" title="Hapus catatan">&times;</button>
        </div>
        <div class="note-body" contenteditable="true">${noteObj.content}</div>
    `;

    const deleteBtn = noteEl.querySelector('.btn-delete');
    const noteBody = noteEl.querySelector('.note-body');

    // --- Drag & Drop Feature (Flexible) ---
    noteEl.addEventListener('mousedown', (e) => {
        // Jangan drag jika user sedang mengetik text atau klik tombol hapus
        if (e.target === noteBody || e.target === deleteBtn) return;

        let shiftX = e.clientX - noteEl.getBoundingClientRect().left;
        let shiftY = e.clientY - noteEl.getBoundingClientRect().top;

        noteEl.style.zIndex = 100; // Bawa catatan yang di-drag ke depan

        function moveAt(clientX, clientY) {
            let newX = clientX - shiftX;
            let newY = clientY - shiftY;

            // Batasi agar tidak keluar layar browser terlalu jauh
            newX = Math.max(0, Math.min(newX, window.innerWidth - noteEl.offsetWidth));
            newY = Math.max(0, Math.min(newY, window.innerHeight - noteEl.offsetHeight));

            noteEl.style.left = newX + 'px';
            noteEl.style.top = newY + 'px';
        }

        function onMouseMove(e) {
            moveAt(e.clientX, e.clientY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = function () {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;
            noteEl.style.zIndex = '';

            // Update koordinat terakhir ke array dan LocalStorage
            const index = notesData.findIndex(n => n.id === noteObj.id);
            if (index !== -1) {
                notesData[index].x = parseInt(noteEl.style.left);
                notesData[index].y = parseInt(noteEl.style.top);
                saveToStorage();
            }
        };
    });

    // Ganti default drag bawaan browser
    noteEl.ondragstart = function () {
        return false;
    };

    // --- Event Update Content (Auto-save) ---
    noteBody.addEventListener('input', () => {
        const index = notesData.findIndex(n => n.id === noteObj.id);
        if (index !== -1) {
            notesData[index].content = noteBody.innerHTML;
            saveToStorage();
        }
    });

    // --- Event Delete Note (Dengan Konfirmasi) ---
    deleteBtn.addEventListener('click', () => {
        const confirmDelete = confirm("Apakah Kamu yakin ingin menghapus catatan ini?");
        if (confirmDelete) {
            noteEl.remove();
            notesData = notesData.filter(n => n.id !== noteObj.id);
            saveToStorage();
        }
    });

    board.appendChild(noteEl);
}

function saveToStorage() {
    localStorage.setItem('saved_notes', JSON.stringify(notesData));
}