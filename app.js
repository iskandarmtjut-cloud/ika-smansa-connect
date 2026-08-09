const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let rows = [];

const $ = (selector) => document.querySelector(selector);


// ===============================
// NAVIGASI
// ===============================

function go(id) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("on", page.id === id);
  });

  document.querySelectorAll("nav button").forEach(button => {
    button.classList.toggle(
      "on",
      button.dataset.page === id
    );
  });

  if (id === "alumni") {
    loadAlumni();
  }
}


document.querySelectorAll("nav button").forEach(button => {

  button.onclick = () => {
    go(button.dataset.page);
  };

});


// ===============================
// KEAMANAN TAMPILAN
// ===============================

function esc(value) {

  return String(value ?? "").replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character])
  );

}


// ===============================
// AMBIL DATA ALUMNI
// ===============================

async function loadAlumni() {

  const status = $("#status");

  if (status) {
    status.textContent =
      "Mengambil data alumni dari database...";
  }

  const result = await client
    .from("alumni")
    .select(
      "id,nama,angkatan,tahun_lulus,profesi,domisili"
    )
    .order("nama");


  if (result.error) {

    console.error(result.error);

    if (status) {
      status.textContent =
        "Belum tersambung ke database.";
    }

    $("#alist").innerHTML = `
      <div class="card error">
        ⚠️ Tidak dapat mengambil data alumni.
        <br><br>
        Periksa koneksi Supabase dan policy database.
      </div>
    `;

    return;
  }


  rows = result.data || [];


  if (status) {

    status.textContent =
      rows.length +
      " alumni tersimpan online.";

  }


  renderAlumni();

}


// ===============================
// TAMPILKAN ALUMNI
// ===============================

function renderAlumni() {

  const search = $("#search");

  const keyword =
    (search.value || "").toLowerCase();


  const filtered = rows.filter(alumni => {

    return Object
      .values(alumni)
      .join(" ")
      .toLowerCase()
      .includes(keyword);

  });


  $("#ca").textContent = rows.length;


  if (filtered.length === 0) {

    $("#alist").innerHTML = `
      <div class="card">
        Belum ada alumni yang cocok.
      </div>
    `;

    return;
  }


  $("#alist").innerHTML = filtered
    .map(alumni => `

      <div class="card item">

        <h3>
          👤 ${esc(alumni.nama)}
        </h3>

        <div class="meta">

          🎓 Angkatan:
          ${esc(alumni.angkatan || "-")}

          <br>

          📅 Tahun lulus:
          ${esc(alumni.tahun_lulus || "-")}

          <br>

          💼 Profesi:
          ${esc(alumni.profesi || "-")}

          <br>

          📍 Domisili:
          ${esc(alumni.domisili || "-")}

        </div>

      </div>

    `)
    .join("");

}


// ===============================
// FORM PENDAFTARAN
// ===============================

function openForm() {

  $("#modal").classList.remove("hide");

}


function closeForm() {

  $("#modal").classList.add("hide");

}


// ===============================
// PENCARIAN
// ===============================

$("#search").addEventListener(
  "input",
  renderAlumni
);


// ===============================
// SIMPAN DATA ALUMNI
// ===============================

$("#form").addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const data =
      Object.fromEntries(
        new FormData(event.target)
      );


    const result = await client
      .from("alumni")
      .insert(data);


    if (result.error) {

      console.error(result.error);

      alert(
        "Data belum berhasil disimpan.\n\n" +
        "Kemungkinan policy INSERT Supabase belum aktif."
      );

      return;
    }


    alert(
      "Alhamdulillah!\n\n" +
      "Data alumni berhasil disimpan."
    );


    event.target.reset();

    closeForm();

    go("alumni");

    await loadAlumni();

  }
);


// ===============================
// MULAI APLIKASI
// ===============================

loadAlumni();
