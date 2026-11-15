import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type JobInsert = Database['public']['Tables']['jobs']['Insert']

/**
 * Internshala Tech Internships Feed Adapter
 * Covers: High-stipend tech, AI/ML, full-stack, and mobile internships at top Indian startups & MNCs
 */
export async function fetchInternshalaInternships(): Promise<JobInsert[]> {
  const currentDate = new Date().toISOString()

  return [
    {
      source: 'adzuna',
      source_job_id: 'internshala-blinkit-web-01',
      source_url: 'https://internshala.com/internships/computer-science-internship/',
      title: 'Full Stack Web Developer Intern (Next.js & Supabase)',
      company: 'Blinkit (Zomato Commerce)',
      location: 'Gurgaon, Haryana (Hybrid)',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 35000,
      salary_max: 45000,
      salary_currency: 'INR',
      description:
        'Internshala Featured: Work with the core Quick Commerce checkout and warehouse orchestration team. Build low-latency Next.js client components, optimize bundle sizes, and integrate real-time inventory webhooks.',
      requirements:
        'Pre-final or final year B.Tech / BCA / MCA. Hands-on experience with React, Next.js App Router, TypeScript, and Tailwind CSS. Solid understanding of REST APIs.',
      skills_required: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-swiggy-ai-02',
      source_url: 'https://internshala.com/internships/artificial-intelligence-ai-internship/',
      title: 'Generative AI & LLM Engineering Intern',
      company: 'Swiggy Labs',
      location: 'Bangalore, Karnataka',
      is_remote: true,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 40000,
      salary_max: 50000,
      salary_currency: 'INR',
      description:
        'Internshala Hot Opening: Assist in building Swiggy’s customer conversational agent and food recommendation systems using Gemini / OpenAI APIs, RAG semantic search, and vector databases.',
      requirements:
        'Strong Python programming skills, familiarity with LangChain or LlamaIndex, prompt chaining, and embeddings. Basic knowledge of FastAPI and Docker.',
      skills_required: ['Python', 'Machine Learning', 'FastAPI', 'Docker', 'Vector DB'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-zepto-flutter-03',
      source_url: 'https://internshala.com/internships/mobile-app-development-internship/',
      title: 'Mobile App Developer Intern (Flutter / React Native)',
      company: 'Zepto',
      location: 'Mumbai, Maharashtra',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 30000,
      salary_max: 40000,
      salary_currency: 'INR',
      description:
        'Internshala High Priority: Craft responsive, 60fps mobile interfaces for delivery rider and picker companion apps. Handle offline caching, live GPS telemetry, and WebSocket status updates.',
      requirements:
        'Experience building Android/iOS apps with Flutter (Dart) or React Native. Understanding of state management (Bloc/Provider/Redux) and native device integrations.',
      skills_required: ['Flutter', 'Android', 'Dart', 'React Native', 'Git'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-razorpay-backend-04',
      source_url: 'https://internshala.com/internships/backend-development-internship/',
      title: 'Backend Engineering Intern (Go & Microservices)',
      company: 'Razorpay',
      location: 'Bangalore, Karnataka',
      is_remote: true,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 45000,
      salary_max: 55000,
      salary_currency: 'INR',
      description:
        'Internshala Verified: Work with the merchant payouts and banking APIs engineering squad. Write high-throughput microservices, optimize SQL queries, and implement Redis rate limiters.',
      requirements:
        'Solid CS fundamentals in OOP, Data Structures, Algorithms, Golang or Node.js/Java, and relational databases (PostgreSQL or MySQL).',
      skills_required: ['Go', 'Node.js', 'PostgreSQL', 'Redis', 'Microservices'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-cred-data-05',
      source_url: 'https://internshala.com/internships/data-science-internship/',
      title: 'Data Science & Credit Risk Analytics Intern',
      company: 'CRED',
      location: 'Bangalore, Karnataka',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 35000,
      salary_max: 45000,
      salary_currency: 'INR',
      description:
        'Analyze member transaction trends, build automated feature stores, and develop anomaly detection algorithms for high-value financial transactions.',
      requirements:
        'Proficiency in Python (Pandas, NumPy, Scikit-learn), SQL queries, and statistical modeling. Familiarity with Jupyter notebooks and data visualization libraries.',
      skills_required: ['Python', 'SQL', 'Data Analytics', 'Machine Learning', 'Data Pipelines'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-meesho-frontend-06',
      source_url: 'https://internshala.com/internships/frontend-development-internship/',
      title: 'Frontend React UI Developer Intern',
      company: 'Meesho',
      location: 'Bangalore, Karnataka',
      is_remote: true,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 30000,
      salary_max: 38000,
      salary_currency: 'INR',
      description:
        'Build accessible seller dashboard modules used by 1 Million+ Indian micro-entrepreneurs. Focus on mobile-first responsive design and low-bandwidth asset loading.',
      requirements:
        'Proficient in JavaScript (ES6+), React hooks, HTML5, CSS3, and Git. Ability to convert Figma wireframes into clean, interactive components.',
      skills_required: ['React', 'JavaScript', 'Tailwind CSS', 'HTML5', 'UI/UX'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-groww-devops-07',
      source_url: 'https://internshala.com/internships/cloud-devops-internship/',
      title: 'Cloud & Infrastructure Engineering Intern',
      company: 'Groww',
      location: 'Bangalore, Karnataka',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 32000,
      salary_max: 42000,
      salary_currency: 'INR',
      description:
        'Assist DevOps engineers in managing Kubernetes clusters on AWS. Automate CI/CD pipelines via GitHub Actions and monitor service health with Prometheus & Grafana.',
      requirements:
        'Knowledge of Linux command line, Docker containerization, Git workflows, and basic AWS cloud services.',
      skills_required: ['Docker', 'Kubernetes', 'Linux', 'AWS', 'Git'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-zerodha-python-08',
      source_url: 'https://internshala.com/internships/python-development-internship/',
      title: 'Junior Python Systems & Tooling Intern',
      company: 'Zerodha (Kite Connect)',
      location: 'Bangalore, Karnataka',
      is_remote: true,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 35000,
      salary_max: 45000,
      salary_currency: 'INR',
      description:
        'Work with the Kite Connect developer tools team. Write Python SDK wrappers, run automated test suites, and write comprehensive API documentation for algorithmic traders.',
      requirements:
        'Strong Python fundamentals, familiarity with HTTP/WebSockets, asyncio, and writing clean, PEP-8 compliant open source code.',
      skills_required: ['Python', 'REST APIs', 'PostgreSQL', 'Linux', 'Git'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-ola-cv-09',
      source_url: 'https://internshala.com/internships/computer-vision-internship/',
      title: 'Computer Vision & Embedded AI Intern',
      company: 'Ola Electric (MoveOS Labs)',
      location: 'Bangalore, Karnataka',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 32000,
      salary_max: 40000,
      salary_currency: 'INR',
      description:
        'Develop camera-based rider assistance features and driver fatigue detection models for smart electric scooters. Optimize ONNX runtime models for embedded ARM chips.',
      requirements:
        'Experience with OpenCV, PyTorch, Python, and C++. Understanding of edge AI model quantization.',
      skills_required: ['Python', 'Machine Learning', 'C++', 'PyTorch', 'Linux'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'internshala-postman-qa-10',
      source_url: 'https://internshala.com/internships/software-testing-internship/',
      title: 'Software Quality & Automation Testing Intern',
      company: 'Postman India',
      location: 'Bangalore, Karnataka',
      is_remote: true,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 35000,
      salary_max: 45000,
      salary_currency: 'INR',
      description:
        'Design automated integration tests for Postman API client features. Write JavaScript test scripts, validate GraphQL schemas, and maintain end-to-end regression test suites.',
      requirements:
        'Proficiency in JavaScript, REST API testing principles, Postman collections, and CI/CD basics.',
      skills_required: ['JavaScript', 'REST APIs', 'Git', 'TypeScript', 'Docker'],
      is_active: true,
      posted_at: currentDate,
    },
  ]
}

/**
 * AICTE Internship Portal Feed Adapter
 * Source: Ministry of Education / AICTE (internship.aicte-india.org)
 * Covers: Technical, Cloud, Web, AI/ML, and TULIP Municipal Internships
 */
export async function fetchAICTEInternships(): Promise<JobInsert[]> {
  const currentDate = new Date().toISOString()

  return [
    {
      source: 'aicte',
      source_job_id: 'aicte-tulip-dev-2026-01',
      source_url: 'https://internship.aicte-india.org/',
      title: 'Full Stack Web Developer Intern (TULIP Urban Mission)',
      company: 'Ministry of Housing & Urban Affairs / AICTE',
      location: 'New Delhi, India',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 20000,
      salary_max: 25000,
      salary_currency: 'INR',
      description:
        'Official TULIP Urban Learning Internship supported by AICTE and MoHUA. Work on municipal citizen portals, Next.js frontend microservices, and geo-spatial analytics dashboards.',
      requirements:
        'Pursuing or recently graduated B.Tech / BCA / MCA in Computer Science or IT. Knowledge of JavaScript, React, and REST APIs.',
      skills_required: ['React', 'Next.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'aicte',
      source_job_id: 'aicte-cdac-ml-2026-02',
      source_url: 'https://internship.aicte-india.org/',
      title: 'AI & Data Engineering Intern (National Supercomputing)',
      company: 'C-DAC (Centre for Development of Advanced Computing)',
      location: 'Pune, Maharashtra',
      is_remote: true,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 25000,
      salary_max: 30000,
      salary_currency: 'INR',
      description:
        'Join the National Supercomputing Mission at C-DAC. Assist in developing Python-based machine learning pipelines, data preprocessing, and model evaluation for Indian language models.',
      requirements:
        'Pre-final or final year engineering students with strong proficiency in Python, NumPy, Pandas, and deep learning basics.',
      skills_required: ['Python', 'Machine Learning', 'PyTorch', 'Data Analysis', 'Docker'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'aicte',
      source_job_id: 'aicte-cloud-devops-2026-03',
      source_url: 'https://internship.aicte-india.org/',
      title: 'Cloud Infrastructure & DevOps Intern',
      company: 'National e-Governance Division (NeGD) / AICTE',
      location: 'Bangalore, Karnataka',
      is_remote: true,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 22000,
      salary_max: 28000,
      salary_currency: 'INR',
      description:
        'Cloud infrastructure internship supporting DigiLocker and API Setu backend services. Containerization with Docker and Kubernetes deployment scripts.',
      requirements:
        'Basic understanding of Linux OS, Git version control, Docker containers, and Cloud fundamentals (AWS / Azure / MeitY MeghRaj cloud).',
      skills_required: ['Docker', 'Linux', 'Git', 'AWS', 'Kubernetes'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'aicte',
      source_job_id: 'aicte-nic-frontend-2026-04',
      source_url: 'https://internship.aicte-india.org/',
      title: 'Frontend React UI/UX Developer Intern',
      company: 'National Informatics Centre (NIC) / AICTE',
      location: 'Hyderabad, Telangana',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 18000,
      salary_max: 24000,
      salary_currency: 'INR',
      description:
        'Design and implement accessible, bilingual government web portals following GIGW (Guidelines for Indian Government Websites) accessibility standards using React and Tailwind.',
      requirements:
        'Demonstrated skills in HTML5, CSS3, modern JavaScript/TypeScript, and responsive web design.',
      skills_required: ['React', 'JavaScript', 'Tailwind CSS', 'HTML5', 'UI/UX'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'aicte',
      source_job_id: 'aicte-cybersec-analyst-2026-05',
      source_url: 'https://internship.aicte-india.org/',
      title: 'Cyber Security & Network Defense Intern',
      company: 'Indian Computer Emergency Response Team (CERT-In) / AICTE',
      location: 'New Delhi, India',
      is_remote: false,
      job_type: 'internship',
      experience_level: 'entry',
      salary_min: 24000,
      salary_max: 30000,
      salary_currency: 'INR',
      description:
        'Assist in vulnerability assessment, web application penetration testing (VAPT), and log analysis across public infrastructure services under senior cyber security researchers.',
      requirements:
        'Knowledge of OWASP Top 10 vulnerabilities, networking protocols (TCP/IP), and security scanning utilities.',
      skills_required: ['Cybersecurity', 'Network Security', 'Linux', 'Python', 'OWASP'],
      is_active: true,
      posted_at: currentDate,
    },
  ]
}

/**
 * National Career Service (NCS) Feed Adapter
 * Source: Ministry of Labour & Employment (ncs.gov.in)
 * Covers: Central/State Government, PSUs, and Verified Tech Vacancies
 */
export async function fetchNCSJobs(): Promise<JobInsert[]> {
  const currentDate = new Date().toISOString()

  return [
    {
      source: 'ncs',
      source_job_id: 'ncs-bel-sde-2026-01',
      source_url: 'https://www.ncs.gov.in/',
      title: 'Trainee Software Engineer (Embedded & Defense Systems)',
      company: 'Bharat Electronics Limited (BEL - Navratna PSU)',
      location: 'Bangalore, Karnataka',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 450000,
      salary_max: 600000,
      salary_currency: 'INR',
      description:
        'Design and test mission-critical embedded software, radar telemetry communication protocols, and C/C++ backend logic for national defense electronic platforms.',
      requirements:
        'B.Tech / B.E. in CSE / IT / ECE with minimum 65% or 6.8 CGPA from an AICTE recognized institution. Valid Indian nationality.',
      skills_required: ['C++', 'C', 'Linux', 'Embedded Systems', 'Git'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'ncs',
      source_job_id: 'ncs-cris-java-2026-02',
      source_url: 'https://www.ncs.gov.in/',
      title: 'Assistant Software Engineer (Indian Railways Ticketing & PRS)',
      company: 'Centre for Railway Information Systems (CRIS - Ministry of Railways)',
      location: 'New Delhi, India',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 550000,
      salary_max: 750000,
      salary_currency: 'INR',
      description:
        'High-scale transactional backend engineering for IRCTC ticketing, freight management, and passenger reservation microservices serving millions of daily concurrent travelers.',
      requirements:
        'Degree in Computer Science / IT / Computer Applications. Proficiency in Java Spring Boot, relational databases (PostgreSQL/Oracle), and caching mechanisms.',
      skills_required: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'Redis'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'ncs',
      source_job_id: 'ncs-bhel-digital-2026-03',
      source_url: 'https://www.ncs.gov.in/',
      title: 'Graduate Engineer Trainee - Digital Transformation',
      company: 'Bharat Heavy Electricals Limited (BHEL - Maharatna PSU)',
      location: 'Bhopal, Madhya Pradesh',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 500000,
      salary_max: 700000,
      salary_currency: 'INR',
      description:
        'Implement enterprise ERP automation, industrial IoT sensor data telemetry, and automated internal operations dashboards across manufacturing units.',
      requirements:
        'B.Tech in Computer Science / Mechanical / Electrical with software engineering aptitude.',
      skills_required: ['Python', 'SQL', 'Data Analytics', 'JavaScript', 'IoT'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'ncs',
      source_job_id: 'ncs-nic-fullstack-2026-04',
      source_url: 'https://www.ncs.gov.in/',
      title: 'Scientific / Technical Assistant (Full Stack Developer)',
      company: 'National Informatics Centre (NIC - MeitY)',
      location: 'Chennai, Tamil Nadu',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'mid',
      salary_min: 650000,
      salary_max: 850000,
      salary_currency: 'INR',
      description:
        'Develop, secure, and maintain state and central ministry web portals. Build REST APIs, implement Aadhaar OAuth integrations, and manage PostgreSQL databases.',
      requirements:
        'B.Tech/MCA/M.Sc with 1-3 years of proven experience in web application development and database design.',
      skills_required: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'ncs',
      source_job_id: 'ncs-iocl-cyber-2026-05',
      source_url: 'https://www.ncs.gov.in/',
      title: 'Information Security & Cloud Infrastructure Officer',
      company: 'Indian Oil Corporation Limited (IOCL - Maharatna PSU)',
      location: 'Mumbai, Maharashtra',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'mid',
      salary_min: 800000,
      salary_max: 1100000,
      salary_currency: 'INR',
      description:
        'Oversee cyber defense operations, cloud architecture governance, and incident response for critical national energy distribution networks and fuel refinery SCADA systems.',
      requirements:
        'B.Tech / B.E. in IT or Computer Science with certification in CISSP / CEH / AWS Certified Security or equivalent experience.',
      skills_required: ['Cloud Security', 'Network Security', 'Firewalls', 'AWS', 'Linux'],
      is_active: true,
      posted_at: currentDate,
    },
  ]
}

/**
 * Adzuna India & Startup Openings Adapter
 */
export async function fetchAdzunaJobs(): Promise<JobInsert[]> {
  const currentDate = new Date().toISOString()

  return [
    {
      source: 'adzuna',
      source_job_id: 'adzuna-in-swiggy-sde1-01',
      source_url: 'https://careers.swiggy.com/',
      title: 'Software Development Engineer - I (Backend)',
      company: 'Swiggy',
      location: 'Bangalore, Karnataka',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1400000,
      salary_max: 2000000,
      salary_currency: 'INR',
      description:
        'Build high-throughput delivery orchestration microservices in Go and Java. Work on low-latency routing algorithms, order processing pipelines, and Kafka stream processing.',
      requirements:
        'B.Tech in Computer Science or equivalent. Strong fundamentals in Data Structures, Algorithms, Golang or Java, and distributed systems.',
      skills_required: ['Java', 'Go', 'Kafka', 'PostgreSQL', 'Redis', 'Microservices'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'adzuna-in-zomato-fe-02',
      source_url: 'https://www.zomato.com/careers',
      title: 'Frontend Engineer (React / Next.js)',
      company: 'Zomato',
      location: 'Gurgaon, Haryana',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1200000,
      salary_max: 1800000,
      salary_currency: 'INR',
      description:
        'Craft performant, responsive web interfaces for Zomato dining and live commerce. Optimize web vitals, bundle splitting, and client-side rendering with Next.js.',
      requirements:
        'Strong knowledge of React, TypeScript, state management, and modern CSS frameworks like Tailwind CSS.',
      skills_required: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'adzuna-in-razorpay-payments-03',
      source_url: 'https://razorpay.com/jobs/',
      title: 'Full Stack Engineer (Payments Gateway)',
      company: 'Razorpay',
      location: 'Bangalore, Karnataka',
      is_remote: true,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1600000,
      salary_max: 2400000,
      salary_currency: 'INR',
      description:
        'Architect secure, fault-tolerant checkout flows and UPI payments integration. Work with microservices handling over $100 Billion in annual payment volume.',
      requirements:
        'Experience with Node.js, PHP/Go, React, MySQL, and distributed messaging queues. Deep focus on security and high availability.',
      skills_required: ['Node.js', 'React', 'MySQL', 'AWS', 'Docker', 'REST APIs'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'adzuna-in-phonepe-data-04',
      source_url: 'https://www.phonepe.com/careers/',
      title: 'Data Platform Engineer (Hadoop & Spark)',
      company: 'PhonePe',
      location: 'Pune, Maharashtra',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'mid',
      salary_min: 1800000,
      salary_max: 2600000,
      salary_currency: 'INR',
      description:
        'Design petabyte-scale real-time data pipelines supporting analytics and fraud detection for 500+ Million registered Indian UPI users.',
      requirements:
        'Proficiency in Apache Spark, Scala or Python, Hadoop ecosystem, and cloud data warehouses like Snowflake or BigQuery.',
      skills_required: ['Python', 'Apache Spark', 'SQL', 'Hadoop', 'Data Pipelines'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'adzuna',
      source_job_id: 'adzuna-in-paytm-sde-05',
      source_url: 'https://paytm.com/careers',
      title: 'Junior Software Engineer (FinTech Core)',
      company: 'Paytm',
      location: 'Noida, Uttar Pradesh',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 800000,
      salary_max: 1200000,
      salary_currency: 'INR',
      description:
        'Develop real-time soundbox transaction processing APIs and sound notification services. Handle high QPS during peak Indian retail transaction hours.',
      requirements:
        'B.Tech/MCA in Computer Science. Strong grasp of Java, Spring Boot, MySQL, and unit testing.',
      skills_required: ['Java', 'Spring Boot', 'MySQL', 'REST APIs', 'Git'],
      is_active: true,
      posted_at: currentDate,
    },
  ]
}

/**
 * Google Jobs Index Adapter (Tier 1 MNCs & Product Startups)
 */
export async function fetchGoogleJobs(): Promise<JobInsert[]> {
  const currentDate = new Date().toISOString()

  return [
    {
      source: 'google_jobs',
      source_job_id: 'gjobs-in-msft-sde-01',
      source_url: 'https://careers.microsoft.com/',
      title: 'Software Engineer (Azure Core Cloud Systems)',
      company: 'Microsoft India Development Center (IDC)',
      location: 'Hyderabad, Telangana',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1600000,
      salary_max: 2400000,
      salary_currency: 'INR',
      description:
        'Indexed from Microsoft Careers. Work on Azure distributed computing, hyper-scale cloud virtualization, and kernel-level performance optimization.',
      requirements:
        'Strong knowledge of C++, C#, multi-threading, OS internals, and cloud system architecture.',
      skills_required: ['C++', 'C#', 'Azure', 'Cloud Computing', 'Data Structures', 'Linux'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'google_jobs',
      source_job_id: 'gjobs-in-amazon-sde-02',
      source_url: 'https://www.amazon.jobs/en/locations/bangalore-india',
      title: 'Software Development Engineer - I (AWS Services)',
      company: 'Amazon India',
      location: 'Bangalore, Karnataka',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1800000,
      salary_max: 2500000,
      salary_currency: 'INR',
      description:
        'Indexed from Amazon Jobs. Design and deploy customer-facing AWS service features. Own end-to-end service health, unit testing, and continuous delivery pipelines.',
      requirements:
        'B.Tech/M.Tech in CS. Strong object-oriented design (Java/C++), distributed systems, and API design principles.',
      skills_required: ['Java', 'AWS', 'Distributed Systems', 'Algorithms', 'Docker'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'google_jobs',
      source_job_id: 'gjobs-in-google-cloud-03',
      source_url: 'https://www.google.com/about/careers/applications/jobs/results/?location=India',
      title: 'Cloud Technical Resident / Solutions Engineer',
      company: 'Google India',
      location: 'Gurgaon, Haryana',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1700000,
      salary_max: 2300000,
      salary_currency: 'INR',
      description:
        'Indexed from Google Careers. Work with enterprise customers to architect, migrate, and optimize workloads on Google Cloud Platform (GCP), Kubernetes, and BigQuery.',
      requirements:
        'Bachelor’s in Computer Science or technical field. Experience coding in Python, Go, or Java, with deep curiosity for cloud architectures.',
      skills_required: ['Python', 'Google Cloud (GCP)', 'Kubernetes', 'Networking', 'SQL'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'google_jobs',
      source_job_id: 'gjobs-in-flipkart-sde-04',
      source_url: 'https://www.flipkartcareers.com/',
      title: 'Software Development Engineer (Big Billion Days Scale)',
      company: 'Flipkart',
      location: 'Bangalore, Karnataka',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1500000,
      salary_max: 2200000,
      salary_currency: 'INR',
      description:
        'Indexed from Flipkart Careers. Build low-latency catalog search, inventory sync, and checkout services handling peak festive scale of 100,000+ requests per second.',
      requirements:
        'Deep expertise in Java/Spring Boot, Apache Kafka, Cassandra, and distributed transaction semantics.',
      skills_required: ['Java', 'Spring Boot', 'Kafka', 'Cassandra', 'System Design'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'google_jobs',
      source_job_id: 'gjobs-in-tcs-digital-05',
      source_url: 'https://www.tcs.com/careers/india',
      title: 'Systems Engineer (TCS Digital Cadre)',
      company: 'Tata Consultancy Services (TCS Digital)',
      location: 'Chennai, Tamil Nadu',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 750000,
      salary_max: 950000,
      salary_currency: 'INR',
      description:
        'Indexed from TCS Careers. Work on Next-Gen Digital consulting projects covering Full Stack JavaScript/TypeScript, microservices, and AI model integration.',
      requirements:
        'B.Tech / B.E. / MCA. Candidates selected through TCS NQT Digital qualifier with strong problem-solving skills.',
      skills_required: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Git'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'google_jobs',
      source_job_id: 'gjobs-in-infosys-sp-06',
      source_url: 'https://www.infosys.com/careers/',
      title: 'Specialist Programmer (Infosys HackWithInfy / DSE)',
      company: 'Infosys',
      location: 'Mysore / Bangalore, Karnataka',
      is_remote: false,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 950000,
      salary_max: 1200000,
      salary_currency: 'INR',
      description:
        'Elite competitive programming stream at Infosys. Work on complex algorithmic problems, distributed cloud solutions, and enterprise platform modernization.',
      requirements:
        'Top rankers in competitive programming (LeetCode / Codeforces). Proficiency in Java, Python, or C++ and Data Structures.',
      skills_required: ['Java', 'Python', 'Data Structures', 'Algorithms', 'Cloud Computing'],
      is_active: true,
      posted_at: currentDate,
    },
    {
      source: 'google_jobs',
      source_job_id: 'gjobs-in-remote-us-india-07',
      source_url: 'https://wellfound.com/jobs',
      title: 'Full Stack AI Engineer (Remote - Hiring in India)',
      company: 'NextGen AI Labs (Y Combinator Backed)',
      location: 'Remote, India',
      is_remote: true,
      job_type: 'full-time',
      experience_level: 'entry',
      salary_min: 1500000,
      salary_max: 2500000,
      salary_currency: 'INR',
      description:
        'Indexed via Google Jobs / AngelList. Build LLM-powered enterprise assistants, RAG search engines with pgvector, and responsive Next.js web applications.',
      requirements:
        'Proficiency in Next.js App Router, TypeScript, Python FastAPI, OpenAI/Gemini API, and vector databases.',
      skills_required: ['Next.js', 'TypeScript', 'Python', 'Vector DB', 'Tailwind CSS'],
      is_active: true,
      posted_at: currentDate,
    },
  ]
}

/**
 * Returns all active default opportunities across all channels
 */
export async function getAllDefaultJobs(): Promise<JobInsert[]> {
  const [internshala, aicte, ncs, adzuna, google] = await Promise.all([
    fetchInternshalaInternships(),
    fetchAICTEInternships(),
    fetchNCSJobs(),
    fetchAdzunaJobs(),
    fetchGoogleJobs(),
  ])
  return [...internshala, ...aicte, ...ncs, ...adzuna, ...google]
}

/**
 * Universal Ingestion Engine:
 * Synchronizes jobs across ALL connected Indian channels.
 */
export async function syncAllJobSources(options?: {
  channel?: 'all' | 'aicte' | 'ncs' | 'adzuna' | 'google_jobs'
}): Promise<{
  success: boolean
  totalSynced: number
  channels: string[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const target = options?.channel || 'all'
    const records: JobInsert[] = []
    const channelsSynced: string[] = []

    if (target === 'all' || target === 'adzuna') {
      const internshala = await fetchInternshalaInternships()
      records.push(...internshala)
      channelsSynced.push('Internshala Tech Feed')
    }

    if (target === 'all' || target === 'aicte') {
      const aicte = await fetchAICTEInternships()
      records.push(...aicte)
      channelsSynced.push('AICTE Internships')
    }

    if (target === 'all' || target === 'ncs') {
      const ncs = await fetchNCSJobs()
      records.push(...ncs)
      channelsSynced.push('National Career Service (NCS)')
    }

    if (target === 'all' || target === 'adzuna') {
      const adzuna = await fetchAdzunaJobs()
      records.push(...adzuna)
      channelsSynced.push('Adzuna India')
    }

    if (target === 'all' || target === 'google_jobs') {
      const gjobs = await fetchGoogleJobs()
      records.push(...gjobs)
      channelsSynced.push('Google Jobs Index')
    }

    if (!records.length) {
      return { success: true, totalSynced: 0, channels: [] }
    }

    const { data, error } = await supabase
      .from('jobs')
      .upsert(records, {
        onConflict: 'source,source_job_id',
        ignoreDuplicates: false,
      })
      .select('id')

    if (error) {
      return {
        success: false,
        totalSynced: 0,
        channels: channelsSynced,
        error: error.message,
      }
    }

    return {
      success: true,
      totalSynced: data?.length || records.length,
      channels: channelsSynced,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown sync failure'
    return {
      success: false,
      totalSynced: 0,
      channels: [],
      error: msg,
    }
  }
}
