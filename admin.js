// Admin JavaScript for Portfolio Website

// 1. Firebase Configuration & Initialization
const firebaseConfig = {
    apiKey: "AIzaSyDSUrdCcffwob-fQLolHgXbmRRGlXBG8CM",
    authDomain: "adarsh-portfolio-28430.firebaseapp.com",
    projectId: "adarsh-portfolio-28430",
    storageBucket: "adarsh-portfolio-28430.firebasestorage.app",
    messagingSenderId: "998179272542",
    appId: "1:998179272542:web:09c1931649504b0f0dc1cf"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
const auth = firebase.auth();

// 2. State & Cache
let currentAdminTab = 'projects';
let dataCache = { projects: [], experience: [], education: [], skills: [], references: [], settings: [] };

// 3. Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Auth Listener
    auth.onAuthStateChanged((user) => {
        const loginSection = document.getElementById('adminLoginSection');
        const contentSection = document.getElementById('adminContent');
        const userEmailDisplay = document.getElementById('userEmailDisplay');

        if (user) {
            if (loginSection) loginSection.style.display = 'none';
            if (contentSection) contentSection.style.display = 'block';
            if (userEmailDisplay) userEmailDisplay.textContent = user.email;
            
            // Start Fetching Data ONLY when logged in
            ['projects', 'experience', 'education', 'skills', 'references', 'settings'].forEach(col => fetchCollection(col));
            switchAdminTab(currentAdminTab);
        } else {
            if (loginSection) loginSection.style.display = 'flex'; // Flex for centering
            if (contentSection) contentSection.style.display = 'none';
        }
    });
});

// 4. Auth Functions
function adminLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log("Logged in:", userCredential.user.email);
        })
        .catch((error) => {
            console.error("Login Error:", error);
            alert("Login Failed: " + error.message);
        });
}

// 5. Data Fetching (Read for List)
function fetchCollection(collectionName) {
    db.collection(collectionName).onSnapshot((snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
            const item = doc.data();
            item.docId = doc.id;
            items.push(item);
        });
        
        // Sort
        if (collectionName !== 'settings') {
            items.sort((a, b) => {
                if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
                return (b.id || 0) - (a.id || 0);
            });
        }

        dataCache[collectionName] = items;
        if (currentAdminTab === collectionName) renderAdminList();
    });
}

// 6. UI Logic
function switchAdminTab(tab) {
    currentAdminTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const btn = document.querySelector(`button[onclick="switchAdminTab('${tab}')"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'settings') {
        const existingConfig = dataCache.settings.find(i => i.docId === 'config');
        document.getElementById('adminList').innerHTML = '';
        document.getElementById('addItemForm').style.display = 'block';
        document.getElementById('editItemId').value = 'config';
        document.getElementById('dynamicFormFields').innerHTML = generateFormFields('settings', existingConfig || {});
        // Hide add button
        const addBtn = document.querySelector('.admin-actions button');
        if (addBtn) addBtn.style.display = 'none';
    } else {
        document.getElementById('addItemForm').style.display = 'none';
        const addBtn = document.querySelector('.admin-actions button');
        if (addBtn) addBtn.style.display = 'inline-flex';
        renderAdminList();
    }
}

function renderAdminList() {
    const container = document.getElementById('adminList'); 
    const items = dataCache[currentAdminTab] || []; 
    container.innerHTML = '';
    
    if (items.length === 0) { 
        container.innerHTML = `<p style="padding:1rem; text-align:center; color:#666;">No items found in ${currentAdminTab}.</p>`; 
        return; 
    }

    items.forEach((item, index) => {
        let title = item.name || item.title || item.role || item.degree || item.category;
        let subtitle = item.company || item.institution || item.relation || item.status || "";
        
        // Disable move buttons at ends
        const upDisabled = index === 0 ? 'opacity:0.3; pointer-events:none;' : '';
        const downDisabled = index === items.length - 1 ? 'opacity:0.3; pointer-events:none;' : '';

        container.innerHTML += `
            <div class="admin-project-item">
                <div style="flex-grow:1; padding-right:1rem;">
                    <strong>${title}</strong>
                    <div style="font-size:0.8rem; color:#666;">${subtitle}</div>
                </div>
                <div class="admin-btn-group">
                    <button class="btn-move" onclick="moveItem('${item.docId}', -1)" style="${upDisabled}">↑</button>
                    <button class="btn-move" onclick="moveItem('${item.docId}', 1)" style="${downDisabled}">↓</button>
                    <div style="width:1px;height:20px;background:#ddd;margin:0 5px;"></div>
                    <button class="btn-edit" onclick="editItem('${item.docId}')">Edit</button>
                    <button class="btn-delete" onclick="deleteItem('${item.docId}')">Delete</button>
                </div>
            </div>`;
    });
}

function showAddItemForm() { 
    document.getElementById('addItemForm').style.display = 'block'; 
    document.getElementById('editItemId').value = ''; 
    document.getElementById('dynamicFormFields').innerHTML = generateFormFields(currentAdminTab); 
    // Scroll to form
    document.getElementById('addItemForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelAddItem() { 
    document.getElementById('addItemForm').style.display = 'none'; 
}

function editItem(docId) { 
    const item = dataCache[currentAdminTab].find(i => i.docId === docId); 
    if (!item) return; 
    
    document.getElementById('addItemForm').style.display = 'block'; 
    document.getElementById('editItemId').value = docId; 
    document.getElementById('dynamicFormFields').innerHTML = generateFormFields(currentAdminTab, item);
    // Scroll to form
    document.getElementById('addItemForm').scrollIntoView({ behavior: 'smooth' });
}

function generateFormFields(type, data = {}) {
    const v = (key) => data[key] || '';

    if (type === 'settings') {
        return `<label style="display:block;margin-bottom:5px;">Resume URL</label>
                <input type="text" id="inp_resumeUrl" placeholder="https://..." value="${v('resumeUrl')}">`;
    }

    if (type === 'projects') return `
        <input type="text" id="inp_title" placeholder="Project Title" value="${v('title')}">
        <input type="text" id="inp_desc" placeholder="Short Description" value="${v('description')}">
        <textarea id="inp_details" placeholder="Detailed Description / Story" rows="5">${v('details')}</textarea>
        <input type="text" id="inp_link" placeholder="Project Link (URL)" value="${v('link')}">
        <input type="text" id="inp_tags" placeholder="Tags (comma separated)" value="${(data.tags || []).join(',')}">
        <select id="inp_visibility">
            <option value="public" ${v('visibility') === 'public' ? 'selected' : ''}>Public</option>
            <option value="private" ${v('visibility') === 'private' ? 'selected' : ''}>Private</option>
        </select>
        <label style="display:flex;align-items:center;gap:10px;margin-top:10px;">
            <input type="checkbox" id="inp_highlight" ${v('highlight') ? 'checked' : ''} style="width:auto;margin:0;"> 
            Highlight (Show bigger card)
        </label>`;

    if (type === 'experience') return `
        <input type="text" id="inp_role" placeholder="Role / Position" value="${v('role')}">
        <input type="text" id="inp_company" placeholder="Company Name" value="${v('company')}">
        <input type="text" id="inp_period" placeholder="Duration (e.g. Jan 2023 - Present)" value="${v('period')}">
        <textarea id="inp_highlights" placeholder="Highlights (One per line)" rows="5">${(data.highlights || []).join('\n')}</textarea>`;

    if (type === 'education') return `
        <input type="text" id="inp_degree" placeholder="Degree" value="${v('degree')}">
        <input type="text" id="inp_field" placeholder="Field of Study" value="${v('field')}">
        <input type="text" id="inp_institution" placeholder="Institution" value="${v('institution')}">
        <input type="text" id="inp_year" placeholder="Year / Duration" value="${v('year')}">`;

    if (type === 'skills') return `
        <input type="text" id="inp_category" placeholder="Category Name" value="${v('category')}">
        <input type="text" id="inp_icon" placeholder="Material Icon Name (e.g. code)" value="${v('icon')}">
        <textarea id="inp_items" placeholder="Skills (comma separated)" rows="3">${(data.items || []).join(',')}</textarea>`;

    if (type === 'references') return `
        <input type="text" id="inp_name" placeholder="Name" value="${v('name')}">
        <input type="text" id="inp_role" placeholder="Position / Role" value="${v('role')}">
        <input type="text" id="inp_company" placeholder="Company" value="${v('company')}">
        <input type="text" id="inp_relation" placeholder="Relation (e.g. Manager)" value="${v('relation')}">
        <input type="text" id="inp_image" placeholder="Image URL (Drive/GitHub)" value="${v('image')}">
        <textarea id="inp_quote" placeholder="Quote / Testimonial" rows="3">${v('quote')}</textarea>
        <input type="text" id="inp_linkedin" placeholder="LinkedIn URL" value="${v('linkedin')}">
        <input type="text" id="inp_email" placeholder="Email Address" value="${v('email')}">`;
        
    return '';
}

// 7. CRUD Operations
function saveItemToFirebase() {
    const docId = document.getElementById('editItemId').value;
    const currentItems = dataCache[currentAdminTab] || [];
    
    // Auto-order for new items
    const maxOrder = currentItems.reduce((max, item) => Math.max(max, item.order || 0), 0);
    
    let data = { id: Date.now() }; 
    if (!docId) data.order = maxOrder + 1;

    // Settings Special Case
    if (currentAdminTab === 'settings') {
        const resumeUrl = document.getElementById('inp_resumeUrl').value;
        db.collection('settings').doc('config').set({ resumeUrl: resumeUrl })
            .then(() => { alert("Saved!"); });
        return;
    }

    // Collect Data based on Tab
    if (currentAdminTab === 'projects') { 
        data.title = document.getElementById('inp_title').value; 
        data.description = document.getElementById('inp_desc').value; 
        data.details = document.getElementById('inp_details').value; 
        data.link = document.getElementById('inp_link').value; 
        data.tags = document.getElementById('inp_tags').value.split(',').map(s => s.trim()).filter(s => s); 
        data.visibility = document.getElementById('inp_visibility').value; 
        data.highlight = document.getElementById('inp_highlight').checked; 
        data.status = 'Active'; 
        data.icon = 'work'; 
    }
    else if (currentAdminTab === 'experience') { 
        data.role = document.getElementById('inp_role').value; 
        data.company = document.getElementById('inp_company').value; 
        data.period = document.getElementById('inp_period').value; 
        data.highlights = document.getElementById('inp_highlights').value.split('\n').filter(s => s.trim()); 
    }
    else if (currentAdminTab === 'education') { 
        data.degree = document.getElementById('inp_degree').value; 
        data.field = document.getElementById('inp_field').value; 
        data.institution = document.getElementById('inp_institution').value; 
        data.year = document.getElementById('inp_year').value; 
    }
    else if (currentAdminTab === 'skills') { 
        data.category = document.getElementById('inp_category').value; 
        data.icon = document.getElementById('inp_icon').value; 
        data.items = document.getElementById('inp_items').value.split(',').map(s => s.trim()).filter(s => s); 
    }
    else if (currentAdminTab === 'references') { 
        data.name = document.getElementById('inp_name').value; 
        data.role = document.getElementById('inp_role').value; 
        data.company = document.getElementById('inp_company').value; 
        data.relation = document.getElementById('inp_relation').value; 
        data.image = document.getElementById('inp_image').value; 
        data.quote = document.getElementById('inp_quote').value; 
        data.linkedin = document.getElementById('inp_linkedin').value; 
        data.email = document.getElementById('inp_email').value; 
    }

    if (docId) {
        db.collection(currentAdminTab).doc(docId).update(data)
            .then(() => { 
                alert("Updated!"); 
                document.getElementById('addItemForm').style.display = 'none'; 
            })
            .catch(err => alert("Error updating: " + err.message));
    } else {
        db.collection(currentAdminTab).add(data)
            .then(() => { 
                alert("Created!"); 
                document.getElementById('addItemForm').style.display = 'none'; 
            })
            .catch(err => alert("Error creating: " + err.message));
    }
}

function deleteItem(docId) { 
    if (confirm("Are you sure you want to delete this item?")) {
        db.collection(currentAdminTab).doc(docId).delete()
            .catch(err => alert("Error deleting: " + err.message));
    }
}

async function moveItem(docId, dir) { 
    const items = [...dataCache[currentAdminTab]]; 
    const idx = items.findIndex(i => i.docId === docId); 
    if (idx === -1) return; 
    
    const tIdx = idx + dir; 
    if (tIdx < 0 || tIdx >= items.length) return;
    
    // Swap Order Values
    // Note: This relies on the sort being stable by order
    // Ideally we should just swap the 'order' fields of the two items
    
    // Simplified logic: 
    // 1. Get current order values
    // 2. Swap them
    // 3. Update both docs
    
    const itemA = items[idx];
    const itemB = items[tIdx];
    
    const orderA = itemA.order || 0;
    const orderB = itemB.order || 0;

    const batch = db.batch();
    
    // Swap orders
    // If orders are same (bad data), increment one
    let newOrderA = orderB;
    let newOrderB = orderA;
    
    if (newOrderA === newOrderB) {
        newOrderA = idx + 1 + dir;
        newOrderB = idx + 1;
    }
    
    batch.update(db.collection(currentAdminTab).doc(itemA.docId), { order: newOrderA });
    batch.update(db.collection(currentAdminTab).doc(itemB.docId), { order: newOrderB });
    
    await batch.commit().catch(err => console.error(err));
}
