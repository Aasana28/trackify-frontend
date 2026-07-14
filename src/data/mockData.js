export const mockApplications = [
  {
    id: 1,
    company: "Google",
    role: "Software Engineer",
    location: "Bengaluru, India",
    salary: "32 LPA",
    status: "Interview Scheduled",
    appliedDate: "2024-05-01",
    followUpDate: "2024-05-15",
    notes: "Referred by college senior. DSA round expected.",
    mood: "Confident",
    link: "https://careers.google.com",
    timeline: [
      { stage: "Applied", date: "2024-05-01", note: "Applied via referral" },
      { stage: "OA Received", date: "2024-05-05", note: "Online assessment scheduled" },
      { stage: "Interview Scheduled", date: "2024-05-10", note: "Round 1 on May 15" }
    ]
  },
  {
    id: 2,
    company: "Infosys",
    role: "Systems Engineer",
    location: "Pune, India",
    salary: "6.5 LPA",
    status: "Applied",
    appliedDate: "2024-04-20",
    followUpDate: "2024-05-20",
    notes: "Applied through campus drive.",
    mood: "Neutral",
    link: "",
    timeline: [
      { stage: "Applied", date: "2024-04-20", note: "Campus placement drive" }
    ]
  },
  {
    id: 3,
    company: "Zepto",
    role: "Frontend Developer",
    location: "Mumbai, India",
    salary: "18 LPA",
    status: "Offer Received",
    appliedDate: "2024-04-10",
    followUpDate: "",
    notes: "Strong culture fit. Offer letter received.",
    mood: "Confident",
    link: "",
    timeline: [
      { stage: "Applied", date: "2024-04-10", note: "Applied via LinkedIn" },
      { stage: "Interview Scheduled", date: "2024-04-15", note: "HR + Technical rounds" },
      { stage: "Offer Received", date: "2024-04-28", note: "18 LPA CTC offered" }
    ]
  },
  {
    id: 4,
    company: "TCS",
    role: "Associate Software Engineer",
    location: "Chennai, India",
    salary: "7 LPA",
    status: "Rejected",
    appliedDate: "2024-03-15",
    followUpDate: "",
    notes: "Did not clear final HR round.",
    mood: "Nervous",
    link: "",
    timeline: [
      { stage: "Applied", date: "2024-03-15", note: "TCS NQT" },
      { stage: "Interview Scheduled", date: "2024-03-22", note: "Technical Interview" },
      { stage: "Rejected", date: "2024-04-01", note: "Not selected after HR round" }
    ]
  },
  {
    id: 5,
    company: "Razorpay",
    role: "Backend Engineer",
    location: "Remote",
    salary: "24 LPA",
    status: "Interview Scheduled",
    appliedDate: "2024-05-05",
    followUpDate: "2024-05-18",
    notes: "Exciting fintech company. System design round expected.",
    mood: "Neutral",
    link: "",
    timeline: [
      { stage: "Applied", date: "2024-05-05", note: "Applied via referral" },
      { stage: "Interview Scheduled", date: "2024-05-12", note: "Technical + System Design" }
    ]
  }
];

export const mockReminders = [
  { id: 1, applicationId: 1, company: "Google", message: "Follow up on Round 1 result", date: "2024-05-15", done: false },
  { id: 2, applicationId: 2, company: "Infosys", message: "Check application status portal", date: "2024-05-20", done: false },
  { id: 3, applicationId: 5, company: "Razorpay", message: "Prepare system design notes", date: "2024-05-18", done: true }
];

export const mockOffers = [
  {
    id: 1,
    company: "Zepto",
    role: "Frontend Developer",
    salary: 1800000,
    location: "Mumbai",
    workMode: "Hybrid",
    benefits: "Health Insurance, Stock Options",
    bond: "None",
    personalScore: 8
  },
  {
    id: 2,
    company: "Razorpay",
    role: "Backend Engineer",
    salary: 2400000,
    location: "Remote",
    workMode: "Remote",
    benefits: "Health Insurance, Meal Allowance",
    bond: "None",
    personalScore: 9
  }
];
