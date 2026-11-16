// Content follows the owner's latest resume. Photo and URLs that are not available yet stay as placeholders.
// EDIT HERE: update facts as experience grows; do not add made-up scores.
export const data = {
  // EDIT HERE: [[THEME_NAME]], [[SEO_TITLE]], [[SEO_DESCRIPTION]]
  themeName: 'DUSTY TRAIL PORTFOLIO',
  seo: {
    title: 'Alfonsus Ronaldy Hidayat | Dusty Trail Portfolio',
    description: 'Alfonsus Ronaldy Hidayat, Information Systems student at Universitas Multimedia Nusantara. Interested in data analytics, database management, data engineering, and self-hosting.',
    // [[SITE_URL]] example: https://your-site.vercel.app/
    url: '',
    // [[OG_IMAGE]] Use your own 1200x630 JPG/PNG for the social preview.
    image: 'assets/img/og-image.png'
  },
  // EDIT HERE: [[FULL_NAME]], [[ROLE]], [[SHORT_TAGLINE]], [[LOCATION]]
  name: 'Alfonsus Ronaldy Hidayat',
  shortName: 'Alfonsus R.H.', // Shown in the header.
  footerName: 'Alfonsus Ronaldy.H', // Shown after the copyright year.
  role: 'Information Systems Student | UMN',
  tagline: 'Exploring data, databases, and self-hosted services.',
  location: 'West Jakarta, Indonesia',
  // EDIT HERE: [[PROFILE_PHOTO: assets/img/profile.jpg, 600x800]]
  profile: { image: 'assets/img/profile.svg', alt: 'Cartoon database server rack wearing a cowboy hat and chewing a piece of straw, in front of a desert sunset', caption: 'Alfonsus Ronaldy Hidayat' },
  // EDIT HERE: summary, word for word from the resume.
  about: [
    'Information Systems student at Universitas Multimedia Nusantara with a strong interest in Data Analytics, Database Management, and Data Engineering. Experienced in developing data-driven projects and analyzing data, as well as managing self-hosted infrastructure and Linux-based environments. Eager to apply technical and analytical skills while gaining practical experience in the data field.'
  ],
  // EDIT HERE: education shown on the Education plate; certificates are listed below it when present.
  education: {
    school: 'Universitas Multimedia Nusantara (UMN)',
    degree: 'Bachelor of Information Systems',
    period: '2024 – 2028 (expected)',
    semester: 'Semester 5',
    gpa: '3.68 / 4.00',
    interests: ['Data Analysis', 'Data Modelling', 'Data Visualization', 'Database Administration', 'Database Development']
  },
  certificates: [], // The resume lists no certificates.
  // EDIT HERE: [[CV_LINK: assets/cv.pdf]]; empty = button hidden.
  cv: 'assets/cv.pdf', // Empty = the download links are hidden.
  // EDIT HERE: skills by category, as in the resume.
  // A 0–100 number is optional, only if you set your own rating.
  skills: [
    { name: 'Programming', level: 'Python · Java · JavaScript', detail: 'Data analysis, deep learning, and web prototypes' },
    { name: 'Databases', level: 'SQL · Database Management', detail: 'Data modelling, administration, and development' },
    { name: 'Data Analytics', level: 'Cleaning · Preprocessing · EDA · Visualization', detail: 'From raw data to findings that are easy to read' },
    { name: 'Data Engineering', level: 'Docker · Linux · Proxmox VE', detail: 'Self-hosted services on a personal home server' },
    { name: 'Tools', level: 'Tableau · Power BI · Excel', detail: 'Also VS Code, Conda, Jupyter Notebook, and GitHub' },
    { name: 'Soft Skills', level: 'Communication · Teamwork', detail: 'Adaptability and building strong working relationships' },
    { name: 'Languages', level: 'Indonesian & English', detail: 'Used in study and work' }
  ],
  // EDIT HERE: [[PROJECT_1..N: title, description, tech stack, demo link, GitHub link, image]]
  // Projects follow the resume. Do not link internal homelab dashboards from the public site.
  projects: [
    { title: 'Traditional Indonesian Song Classification', category: 'Deep learning · Team project', description: 'Classifies traditional Indonesian songs by cultural region. Built and processed a dataset of 855 songs (61.3 hours) from 38 provinces grouped into 7 cultural regions, generating 78,074 five-second audio clips. Train, validation, and test sets were split at song level to prevent data leakage. Wav2Vec 2.0 and HuBERT were fine-tuned and compared at clip and song level.', tech: ['Python', 'PyTorch', 'Hugging Face Transformers', 'Librosa', 'Wav2Vec 2.0', 'HuBERT'], image: 'assets/img/song-preview.webp', alt: 'README of the Klasifikasi Musik Tradisional Indonesia project: Python, PyTorch, Hugging Face and Librosa badges, and the dataset stats 855 songs, 61.3 hours, 38 provinces, 7 cultural regions, 78,074 clips', demo: '', github: 'https://github.com/ChrisZo11/klasifikasi-musik-tradisional-indonesia', completed: false },
    { title: 'Proxmox Home Server', category: 'Homelab & self-hosting', description: 'A self-hosted home server built with Proxmox VE to manage five Linux containers. It runs Docker-based services, uses Tailscale subnet routing for secure remote access, and Pi-hole for local DNS. A centralized dashboard monitors CPU usage, memory, and service availability.', tech: ['Proxmox VE', 'Linux Containers', 'Docker', 'Tailscale', 'Pi-hole', 'Homepage'], image: 'assets/img/proxmox-preview.webp', alt: 'Supmaxing Home Lab dashboard with Proxmox VE metrics and the status of Dockge, Tailscale, Pi-hole, 9Router AI, and Jellyfin', demo: '', github: '', completed: false }, // The SupRill/proxmox-homelab repo is still private; fill in github once it is public.
    { title: 'GATE, Social-Impact Freelance Platform', category: 'UI/UX · Front-end prototype · Team project', description: 'A front-end prototype of a social-impact freelance platform connecting freelancers, employers, and foundations. It has three user roles and features such as job feed, job posting, profiles, chat, reviews, and GATE Pay. Includes simulated OTP sending, sortable tables, and a simple chat; it is not connected to a backend.', tech: ['HTML', 'CSS', 'Bootstrap', 'JavaScript', 'jQuery'], image: 'assets/img/gate-preview.webp', alt: 'GATE home page with the headline Your Gate to Work and Social Impact', demo: '', github: 'https://github.com/amaliacalista26/GATE_PROJECT', completed: true }
  ],
  // EDIT HERE: [[EXPERIENCE_1..N: organization, position, period, description]]
  experience: [
    { company: 'ISFEST, UMN', position: 'Academic Committee Member', period: 'May 2026 – Nov 2026', description: 'ISFEST is the annual program of HIMSI UMN. Developed a data competition case study focused on forecasting electric vehicle charging station utilization, defined assessment criteria covering data preparation, exploratory data analysis (EDA), predictive modelling, and result interpretation, and evaluated participants\' submissions during the semifinal round.' },
    { company: 'Seminar on Information Systems (DataMyst), UMN', position: 'Operator', period: 'Mar 2025 – Jul 2025', description: 'Part of a 15-student team running a seminar series with industry practitioners on Big Data, Data Science, ERP/SAP, and Database. Operated the technical setup for live sessions and compiled a group book summary of the series. Gained a foundational understanding of data analytics pipelines (ETL/ELT, data lakes and warehouses) and database design (SQL vs. NoSQL, indexing, partitioning).' }
  ],
  // EDIT HERE: [[EMAIL]], [[WHATSAPP]], [[LINKEDIN]], [[GITHUB]], [[INSTAGRAM]]
  contact: {
    intro: 'Want to talk about data, databases, or self-hosting? Send me a message by email.',
    email: 'ronaldyhdy@gmail.com',
    whatsapp: '', // International format without +, e.g. '6281234567890'
    linkedin: 'https://www.linkedin.com/in/alfonsus-ronaldy-hidayat/',
    github: 'https://github.com/SupRill',
    instagram: '', // e.g. 'https://www.instagram.com/username/'
    formEndpoint: '' // Empty = form shows but does not send. Example: 'https://formspree.io/f/abcdefgh'
  },
  // EDIT HERE: [[AMBIENT_AUDIO]]; empty = sound button hidden.
  ambientAudio: '', // e.g. 'assets/ambient.mp3', must be your own or licensed.
  // EDIT HERE: animation tempo. Larger = slower.
  motion: { duration: 0.8, intro: 1.6, particles: 38 }
};
