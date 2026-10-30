/**
 * Authentic Synthetic Dataset of Central and State Welfare Schemes.
 * Represents messy real-world text extracted from government PDFs, circulars, and portals.
 * Complete with precise provenance (source document, section, link, capture date).
 */

export const SAMPLE_SCHEMES = [
  {
    scheme_ref: "SCHEME_CEN_PMKISAN_001",
    scheme_name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    state: "Central",
    ministry_or_department: "Ministry of Agriculture & Farmers Welfare",
    raw_fields: {
      benefits: [
        {
          raw_text:
            "Under the scheme, financial benefit of ₹6,000 per year is provided to eligible farmer families in three equal instalments of ₹2,000 each every 4 months directly credited into their Aadhaar-linked bank accounts.",
          evidence: {
            source_text: "financial benefit of ₹6,000 per year is provided ... in three equal instalments of ₹2,000 each",
            location: "Section 3.1, Scheme Guidelines (Revised)",
            source_ref: "https://pmkisan.gov.in/Documents/OperationalGuidelines.pdf",
            captured_date: "2024-04-15"
          }
        }
      ],
      eligibility: [
        {
          raw_text:
            "Small and marginal farmers holding cultivable land less than 2 hectares and annual family income under ₹2.5 lakh.",
          evidence: {
            source_text: "holding cultivable land less than 2 hectares and annual family income under ₹2.5 lakh",
            location: "Section 4.2 'Eligibility Criteria', Page 7",
            source_ref: "https://pmkisan.gov.in/Documents/OperationalGuidelines.pdf",
            captured_date: "2024-04-15"
          }
        }
      ]
    }
  },
  {
    scheme_ref: "SCHEME_CEN_PMJAY_002",
    scheme_name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
    state: "Central",
    ministry_or_department: "National Health Authority",
    raw_fields: {
      benefits: [
        {
          raw_text:
            "PM-JAY provides a health insurance cover of up to ₹5 lakh per family per year for secondary and tertiary care hospitalization across empanelled public and private hospitals.",
          evidence: {
            source_text: "health insurance cover of up to ₹5 lakh per family per year",
            location: "Clause 1.2, NHA Policy Manual",
            source_ref: "https://nha.gov.in/PMJAY/guidelines.pdf",
            captured_date: "2024-05-10"
          }
        }
      ],
      eligibility: [
        {
          raw_text:
            "Deprived rural families and identified occupational categories of urban workers' families as per SECC 2011 database with annual income under 1.5 lakh.",
          evidence: {
            source_text: "families as per SECC 2011 database with annual income under 1.5 lakh",
            location: "Annexure B, Target Beneficiary Identification",
            source_ref: "https://nha.gov.in/PMJAY/guidelines.pdf",
            captured_date: "2024-05-10"
          }
        }
      ]
    }
  },
  {
    scheme_ref: "SCHEME_MH_SGNY_003",
    scheme_name: "Sanjay Gandhi Niradhar Anudan Yojana",
    state: "Maharashtra",
    ministry_or_department: "Social Justice and Special Assistance Department",
    raw_fields: {
      benefits: [
        {
          raw_text:
            "Financial assistance of Rs. 1,500 per month is paid to eligible single beneficiaries, and Rs. 2,000 per month for families with two or more beneficiaries.",
          evidence: {
            source_text: "Financial assistance of Rs. 1,500 per month is paid",
            location: "GR No. SGNY-2023/CR-88/Scheme-2, Page 2",
            source_ref: "https://sjsa.maharashtra.gov.in/gr/sgny2023.pdf",
            captured_date: "2024-01-20"
          }
        }
      ],
      eligibility: [
        {
          raw_text:
            "Resident of Maharashtra only, aged between 18 and 65 years, having certified disability of 40% and above or destitute widow, with annual family income under ₹50,000.",
          evidence: {
            source_text: "Resident of Maharashtra only, aged between 18 and 65 years ... disability of 40% and above ... income under ₹50,000",
            location: "Rule 4(1), GR No. SGNY-2023",
            source_ref: "https://sjsa.maharashtra.gov.in/gr/sgny2023.pdf",
            captured_date: "2024-01-20"
          }
        }
      ]
    }
  },
  {
    scheme_ref: "SCHEME_UP_VIVAH_004",
    scheme_name: "UP Shadi Anudan Yojana (Vivah Hetu Anudan)",
    state: "Uttar Pradesh",
    ministry_or_department: "Social Welfare Department, UP",
    raw_fields: {
      benefits: [
        {
          raw_text:
            "A one-time financial grant of Rs. 20,000/- is given per daughter for marriage expenses (maximum two daughters per family).",
          evidence: {
            source_text: "one-time financial grant of Rs. 20,000/- is given",
            location: "Notification SW-441/2022, Para 3",
            source_ref: "http://shadianudan.upsdc.gov.in/rules.pdf",
            captured_date: "2023-11-05"
          }
        }
      ],
      eligibility: [
        {
          raw_text:
            "SC/ST families with income under ₹2.5 lakh and daughter age 18 and above.",
          evidence: {
            source_text: "SC/ST families with income under ₹2.5 lakh and daughter age 18 and above",
            location: "Eligibility Section, Para 2(a)",
            source_ref: "http://shadianudan.upsdc.gov.in/rules.pdf",
            captured_date: "2023-11-05"
          }
        }
      ]
    }
  },
  {
    scheme_ref: "SCHEME_MP_LADLI_005",
    scheme_name: "Mukhyamantri Ladli Behna Yojana",
    state: "Madhya Pradesh",
    ministry_or_department: "Women and Child Development Department",
    raw_fields: {
      benefits: [
        {
          raw_text:
            "Eligible women will receive Rs. 1,250 per month directly into their Aadhaar-seeded DBT accounts on the 10th of every month.",
          evidence: {
            source_text: "receive Rs. 1,250 per month directly into their Aadhaar-seeded DBT accounts",
            location: "Scheme Brochure 2024, Page 3",
            source_ref: "https://ladlibehna.mp.gov.in/docs/brochure.pdf",
            captured_date: "2024-06-01"
          }
        }
      ],
      eligibility: [
        {
          raw_text:
            "Married, widowed or destitute women aged between 21 and 60 years with annual family income under ₹2.5 lakh and land holding less than 5 acres.",
          evidence: {
            source_text: "women aged between 21 and 60 years with annual family income under ₹2.5 lakh and land holding less than 5 acres",
            location: "Operational Circular WCD-2023-102",
            source_ref: "https://ladlibehna.mp.gov.in/docs/brochure.pdf",
            captured_date: "2024-06-01"
          }
        }
      ]
    }
  },
  {
    scheme_ref: "SCHEME_TN_CYCLE_006",
    scheme_name: "Free Bicycle Scheme for Higher Secondary Students",
    state: "Tamil Nadu",
    ministry_or_department: "Backward Classes, Most Backward Classes & Minorities Welfare Department",
    raw_fields: {
      benefits: [
        {
          raw_text:
            "Distribution of one free standard bicycle to each eligible student studying in Class XI in Government and Government-aided higher secondary schools.",
          evidence: {
            source_text: "one free standard bicycle to each eligible student studying in Class XI",
            location: "Policy Note 2023-2024, Demand No. 9",
            source_ref: "https://bcmbcmw.tn.gov.in/policy_notes/2023.pdf",
            captured_date: "2024-02-14"
          }
        }
      ],
      eligibility: [
        {
          raw_text:
            "Girl students enrolled in Class 11 belonging to SC, ST or OBC categories.",
          evidence: {
            source_text: "Girl students ... belonging to SC, ST or OBC categories",
            location: "Eligibility Criteria, Page 12",
            source_ref: "https://bcmbcmw.tn.gov.in/policy_notes/2023.pdf",
            captured_date: "2024-02-14"
          }
        }
      ]
    }
  },
  {
    scheme_ref: "SCHEME_DISCRETIONARY_007",
    scheme_name: "Chief Minister Special Discretionary Relief Fund",
    state: "State",
    ministry_or_department: "Chief Minister Secretariat",
    raw_fields: {
      benefits: [
        {
          raw_text:
            "Financial grant will be sanctioned on a case-by-case basis at the sole discretion of the District Collector subject to availability of funds.",
          evidence: {
            source_text: "sanctioned on a case-by-case basis at the sole discretion of the District Collector",
            location: "Circular Sec/CMRF-09/2021",
            source_ref: "https://cmrf.state.gov.in/rules.pdf",
            captured_date: "2024-03-01"
          }
        }
      ],
      eligibility: [
        {
          raw_text:
            "Applicant must be of good moral character and obtain a recommendation of the local Sarpanch or Gram Sabha.",
          evidence: {
            source_text: "Applicant must be of good moral character and obtain a recommendation of the local Sarpanch",
            location: "Clause 5 'Character Verification'",
            source_ref: "https://cmrf.state.gov.in/rules.pdf",
            captured_date: "2024-03-01"
          }
        }
      ]
    }
  },
  {
    scheme_ref: "SCHEME_CONFLICT_008",
    scheme_name: "Post-Matric Scholarship Scheme for SC Students",
    state: "Central",
    ministry_or_department: "Ministry of Social Justice and Empowerment",
    raw_fields: {
      benefits: [
        {
          raw_text: "Compulsory non-refundable tuition fees reimbursed with monthly maintenance allowance of Rs 1,200 per month.",
          evidence: {
            source_text: "maintenance allowance of Rs 1,200 per month",
            location: "Section 5.3, Revised Norms 2024",
            source_ref: "https://socialjustice.gov.in/schemes/postmatric2024.pdf",
            captured_date: "2024-07-01"
          }
        }
      ],
      eligibility: [
        {
          raw_text: "SC students with annual family income under ₹2.0 lakh.",
          evidence: {
            source_text: "SC students with annual family income under ₹2.0 lakh",
            location: "Notification MSJE-2021/44, Clause 3",
            source_ref: "https://socialjustice.gov.in/archive/guidelines2021.pdf",
            captured_date: "2021-08-10"
          }
        },
        {
          raw_text: "SC students with annual family income under ₹2.5 lakh.",
          evidence: {
            source_text: "SC students with annual family income under ₹2.5 lakh",
            location: "Gazette Notification No. 109/2024, Page 4",
            source_ref: "https://socialjustice.gov.in/schemes/gazette2024.pdf",
            captured_date: "2024-07-01"
          }
        }
      ]
    }
  }
];

