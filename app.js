// =====================================================
// KOMUNITAS ASOE LHOK LHOKSEUMAWE
// app.js
// =====================================================

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let members = [];
let currentUser = null;

const $ = (selector) => document.querySelector(selector);


// =====================================================
// KEAMANAN OUTPUT HTML
// =====================================================

function esc(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character])
  );

}


// =====================================================
// NAVIGASI
// =====================================================

function go(id) {

  document.querySelectorAll(".page").forEach(page => {

    page.classList.toggle(
      "on",
      page.id === id
    );

  });


  document.querySelectorAll("nav button").forEach(button => {

    button.classList.toggle(
      "on",
      button.dataset.page === id
    );

  });


  if (id === "members") {
    loadMembers();
  }


  if (id === "admin") {
    checkSession();
  }

}


// =====================================================
// NAVIGASI MENU
// =====================================================

document.querySelectorAll("nav button").forEach(button => {

  button.onclick = () => {

    go(button.dataset.page);

  };

});


// =====================================================
// AMBIL ANGGOTA YANG SUDAH DISETUJUI
// =====================================================

async function loadMembers() {

  const status = $("#status");

  if (status) {

    status.textContent =
      "Mengambil data anggota...";

  }


  const result = await client
    .from("members")
    .select(`
      id,
      nama_lengkap,
      kecamatan_asal,
      gampong_asal,
      profesi,
      domisili_sekarang,
      status
    `)
    .eq("status", "approved")
    .order("nama_lengkap");


  if (result.error) {

    console.error(result.error);

    if (status) {

      status.textContent =
        "Belum dapat mengambil data anggota.";

    }

    if ($("#alist")) {

      $("#alist").innerHTML = `
        <div class="card error">
          ⚠️ Data anggota belum dapat ditampilkan.
        </div>
      `;

    }

    return;

  }


  members = result.data || [];


  if (status) {

    status.textContent =
      members.length +
      " anggota terverifikasi.";

  }


  renderMembers();

}


// =====================================================
// TAMPILKAN DIREKTORI ANGGOTA
// =====================================================

function renderMembers() {

  const search = $("#search");

  const keyword =
    (search?.value || "")
      .toLowerCase()
      .trim();


  const filtered = members.filter(member => {

    return [

      member.nama_lengkap,
      member.kecamatan_asal,
      member.gampong_asal,
      member.profesi,
      member.domisili_sekarang

    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);

  });


  if ($("#ca")) {

    $("#ca").textContent =
      members.length;

  }


  if (!$("#alist")) return;


  if (filtered.length === 0) {

    $("#alist").innerHTML = `
      <div class="card">
        Belum ada anggota terverifikasi
        yang cocok dengan pencarian.
      </div>
    `;

    return;

  }


  $("#alist").innerHTML = filtered
    .map(member => `

      <div class="card item">

        <h3>
          👤 ${esc(member.nama_lengkap)}
        </h3>

        <div class="meta">

          🏠 Asal:
          ${esc(member.gampong_asal || "-")},
          ${esc(member.kecamatan_asal || "-")}

          <br>

          💼 Profesi:
          ${esc(member.profesi || "-")}

          <br>

          📍 Domisili:
          ${esc(member.domisili_sekarang || "-")}

        </div>

      </div>

    `)
    .join("");

}


// =====================================================
// PENCARIAN
// =====================================================

if ($("#search")) {

  $("#search").addEventListener(
    "input",
    renderMembers
  );

}


// =====================================================
// MODAL PENDAFTARAN
// =====================================================

function openForm() {

  $("#modal")?.classList.remove("hide");

}


function closeForm() {

  $("#modal")?.classList.add("hide");

}


// =====================================================
// PENDAFTARAN ANGGOTA
// =====================================================

$("#form")?.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const formData =
      new FormData(event.target);


    const member = {

      nama_lengkap:
        formData.get("nama_lengkap")?.trim(),

      tempat_lahir:
        formData.get("tempat_lahir")?.trim() || null,

      tanggal_lahir:
        formData.get("tanggal_lahir") || null,

      nik:
        formData.get("nik")?.trim() || null,

      kecamatan_asal:
        formData.get("kecamatan_asal")?.trim(),

      gampong_asal:
        formData.get("gampong_asal")?.trim(),

      domisili_sekarang:
        formData.get("domisili_sekarang")?.trim() || null,

      profesi:
        formData.get("profesi")?.trim() || null,

      nomor_whatsapp:
        formData.get("nomor_whatsapp")?.trim() || null,

      status:
        "pending"

    };


    const result = await client
      .from("members")
      .insert(member)
      .select("id")
      .single();


    if (result.error) {

      console.error(result.error);

      alert(
        "Pendaftaran belum berhasil.\n\n" +
        result.error.message
      );

      return;

    }


    const memberId =
      result.data.id;


    // -----------------------------------------------
    // DATA KELUARGA RAHASIA
    // -----------------------------------------------

    const family = {

      member_id:
        memberId,

      nama_ayah:
        formData.get("nama_ayah")?.trim() || null,

      asal_ayah:
        formData.get("asal_ayah")?.trim() || null,

      nama_ibu:
        formData.get("nama_ibu")?.trim() || null,

      asal_ibu:
        formData.get("asal_ibu")?.trim() || null,

      nama_kakek_ayah:
        formData.get("nama_kakek_ayah")?.trim() || null,

      nama_nenek_ayah:
        formData.get("nama_nenek_ayah")?.trim() || null,

      nama_kakek_ibu:
        formData.get("nama_kakek_ibu")?.trim() || null,

      nama_nenek_ibu:
        formData.get("nama_nenek_ibu")?.trim() || null,

      keterangan_asal_lhokseumawe:
        formData
          .get("keterangan_asal_lhokseumawe")
          ?.trim() || null

    };


    const familyResult = await client
      .from("member_family_private")
      .insert(family);


    if (familyResult.error) {

      console.error(familyResult.error);

      alert(
        "Data anggota tersimpan, tetapi " +
        "data keluarga belum berhasil disimpan.\n\n" +
        familyResult.error.message
      );

      return;

    }


    alert(
      "Alhamdulillah!\n\n" +
      "Pendaftaran berhasil dikirim.\n\n" +
      "Status: MENUNGGU VERIFIKASI\n\n" +
      "Pengurus akan memeriksa data Anda."
    );


    event.target.reset();

    closeForm();

  }
);


// =====================================================
// LOGIN PENGURUS
// =====================================================

$("#login-form")?.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const email =
      $("#login-email").value.trim();

    const password =
      $("#login-password").value;


    const status =
      $("#login-status");


    status.textContent =
      "Memeriksa akun...";


    const result =
      await client.auth.signInWithPassword({

        email,
        password

      });


    if (result.error) {

      console.error(result.error);

      status.textContent =
        "Login gagal: " +
        result.error.message;

      return;

    }


    currentUser =
      result.data.user;


    status.textContent =
      "Login berhasil.";


    await checkAdmin();


  }
);


// =====================================================
// CEK SESSION
// =====================================================

async function checkSession() {

  const result =
    await client.auth.getSession();


  currentUser =
    result.data.session?.user || null;


  if (!currentUser) {

    showLogin();

    return;

  }


  await checkAdmin();

}


// =====================================================
// CEK APAKAH USER ADALAH PENGURUS
// =====================================================

async function checkAdmin() {

  const result =
    await client
      .from("community_admins")
      .select("user_id,nama,jabatan,aktif")
      .eq("user_id", currentUser.id)
      .eq("aktif", true)
      .maybeSingle();


  if (result.error || !result.data) {

    showLogin();

    $("#login-status").textContent =
      "Akun ini bukan akun pengurus.";

    await client.auth.signOut();

    return;

  }


  showAdminPanel();

  await loadPendingMembers();

}


// =====================================================
// TAMPILKAN LOGIN
// =====================================================

function showLogin() {

  $("#admin-login")?.classList.remove("hide");

  $("#admin-panel")?.classList.add("hide");

}


// =====================================================
// TAMPILKAN PANEL ADMIN
// =====================================================

function showAdminPanel() {

  $("#admin-login")?.classList.add("hide");

  $("#admin-panel")?.classList.remove("hide");

}


// =====================================================
// AMBIL PENDAFTAR PENDING
// =====================================================

async function loadPendingMembers() {

  const container =
    $("#pending-list");


  if (!container) return;


  container.innerHTML =
    `<p class="muted">
      Mengambil data pendaftar...
    </p>`;


  const result =
    await client.rpc(
      "get_pending_members"
    );


  if (result.error) {

    console.error(result.error);

    container.innerHTML =
      `<div class="card error">
        ⚠️ Tidak dapat mengambil
        data pendaftar.
        <br><br>
        ${esc(result.error.message)}
      </div>`;

    return;

  }


  const pending =
    result.data || [];


  if (pending.length === 0) {

    container.innerHTML =
      `<div class="card">
        🎉 Tidak ada pendaftaran
        yang menunggu persetujuan.
      </div>`;

    return;

  }


  container.innerHTML =
    pending
      .map(member => `

        <div class="card item">

          <h3>
            👤 ${esc(member.nama_lengkap)}
          </h3>

          <div class="meta">

            🏠
            ${esc(member.gampong_asal || "-")},
            ${esc(member.kecamatan_asal || "-")}

            <br>

            📍
            ${esc(member.domisili_sekarang || "-")}

            <br>

            💼
            ${esc(member.profesi || "-")}

          </div>


          <details>

            <summary>
              🔎 Lihat Data Verifikasi
            </summary>

            <p>
              <strong>NIK:</strong>
              ${esc(member.nik || "-")}
            </p>

            <p>
              <strong>Tempat lahir:</strong>
              ${esc(member.tempat_lahir || "-")}
            </p>

            <p>
              <strong>Tanggal lahir:</strong>
              ${esc(member.tanggal_lahir || "-")}
            </p>

            <hr>

            <h4>
              👨‍👩‍👧 Data Keluarga
            </h4>

            <p>
              Ayah:
              ${esc(member.nama_ayah || "-")}
              <br>
              Asal:
              ${esc(member.asal_ayah || "-")}
            </p>

            <p>
              Ibu:
              ${esc(member.nama_ibu || "-")}
              <br>
              Asal:
              ${esc(member.asal_ibu || "-")}
            </p>

            <p>
              Kakek dari ayah:
              ${esc(member.nama_kakek_ayah || "-")}
              <br>
              Nenek dari ayah:
              ${esc(member.nama_nenek_ayah || "-")}
            </p>

            <p>
              Kakek dari ibu:
              ${esc(member.nama_kakek_ibu || "-")}
              <br>
              Nenek dari ibu:
              ${esc(member.nama_nenek_ibu || "-")}
            </p>

            <p>
              <strong>
                Keterangan asal-usul:
              </strong>

              <br>

              ${esc(
                member.keterangan_asal_lhokseumawe
                || "-"
              )}

            </p>

          </details>


          <div class="actions">

            <button
              class="primary"
              onclick="approveMember('${member.id}')"
            >
              ✅ SETUJUI
            </button>

            <button
              class="secondary"
              onclick="rejectMember('${member.id}')"
            >
              ❌ TOLAK
            </button>

          </div>

        </div>

      `)
      .join("");

}


// =====================================================
// SETUJUI ANGGOTA
// =====================================================

async function approveMember(memberId) {

  if (
    !confirm(
      "Setujui pendaftaran anggota ini?"
    )
  ) {

    return;

  }


  const result =
    await client.rpc(
      "approve_member",
      {
        p_member_id:
          memberId
      }
    );


  if (result.error) {

    console.error(result.error);

    alert(
      "Gagal menyetujui anggota.\n\n" +
      result.error.message
    );

    return;

  }


  alert(
    "Alhamdulillah!\n\n" +
    "Anggota berhasil disetujui.\n\n" +
    "Nomor Anggota:\n" +
    result.data
  );


  await loadPendingMembers();

}


// =====================================================
// TOLAK ANGGOTA
// =====================================================

async function rejectMember(memberId) {

  if (
    !confirm(
      "Tolak pendaftaran anggota ini?"
    )
  ) {

    return;

  }


  const result =
    await client.rpc(
      "reject_member",
      {
        p_member_id:
          memberId
      }
    );


  if (result.error) {

    console.error(result.error);

    alert(
      "Gagal menolak pendaftaran.\n\n" +
      result.error.message
    );

    return;

  }


  alert(
    "Pendaftaran telah ditolak."
  );


  await loadPendingMembers();

}


// =====================================================
// LOGOUT
// =====================================================

async function adminLogout() {

  await client.auth.signOut();

  currentUser = null;

  showLogin();

  $("#login-status").textContent =
    "Anda telah keluar.";

}


// =====================================================
// PERUBAHAN SESSION
// =====================================================

client.auth.onAuthStateChange(
  (event, session) => {

    currentUser =
      session?.user || null;

  }
);


// =====================================================
// MULAI APLIKASI
// =====================================================

loadMembers();

checkSession();
