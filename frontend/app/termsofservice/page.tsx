// ─── TERMS OF SERVICE ─────────────────────────────────────────────────────────
"use client";
import Footer from "@/components/layout/Footer";
import { MarketingNav, MarketingFooter, PageHero, LegalProse, LegalSection } from "../../components/layout/Marketinglayout";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <MarketingNav />
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="Please read these terms carefully before using Planzo. They govern your use of our platform."
        updated="March 1, 2026"
      />
      <LegalProse>
        <p className="text-[15px] text-zinc-400 leading-relaxed border-l-2 border-indigo-500/40 pl-4">
          By accessing or using Planzo ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
        </p>

        <LegalSection title="Acceptance of terms">
          <p>These Terms constitute a legally binding agreement between you and Planzo. You must be at least 13 years old to use the Service. By using the Service on behalf of an organisation, you represent that you have authority to bind that organisation.</p>
        </LegalSection>

        <LegalSection title="Your account">
          <p>You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorised access. Planzo is not liable for losses resulting from unauthorised use of your account.</p>
          <p>You may not share your account, create multiple accounts, or use another person's account without permission.</p>
        </LegalSection>

        <LegalSection title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-none space-y-2">
            {[
              "Use the Service for illegal, harmful, or fraudulent purposes",
              "Upload malware, viruses, or malicious code",
              "Attempt to reverse-engineer, scrape, or access the API without authorisation",
              "Harass, threaten, or intimidate other users",
              "Misrepresent your identity or impersonate others",
              "Interfere with the Service's infrastructure or security",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/70 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
        </LegalSection>

        <LegalSection title="Intellectual property">
          <p>You retain ownership of all content you create in Planzo. By uploading content, you grant Planzo a limited licence to store, display, and process that content solely to provide the Service.</p>
          <p>Planzo retains ownership of the platform, code, design, trademarks, and all intellectual property inherent to the Service itself.</p>
        </LegalSection>

        <LegalSection title="AI features">
          <p>Planzo uses third-party AI services (Google Gemini) to power certain features. AI-generated content is provided as-is. You are responsible for reviewing and verifying AI outputs before acting on them. We make no warranty about the accuracy of AI-generated suggestions.</p>
        </LegalSection>

        <LegalSection title="Payment and billing">
          <p>Paid features are billed in advance on a monthly or annual basis. All fees are non-refundable except where required by law. We reserve the right to change pricing with 30 days' notice.</p>
        </LegalSection>

        <LegalSection title="Termination">
          <p>You may terminate your account at any time from the settings page. We may terminate or suspend your access immediately, without notice, for violations of these Terms.</p>
          <p>On termination, your right to use the Service ceases. Your data will be deleted within 30 days.</p>
        </LegalSection>

        <LegalSection title="Disclaimers and limitation of liability">
          <p>The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Planzo is not liable for any indirect, incidental, special, consequential, or punitive damages.</p>
          <p>Our total liability to you for any claim arising from use of the Service shall not exceed the amount you paid us in the 12 months prior to the claim.</p>
        </LegalSection>

        <LegalSection title="Governing law">
          <p>These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts in Raipur, Chhattisgarh, India.</p>
        </LegalSection>

        <LegalSection title="Contact">
          <p>Questions about these Terms? Email <a href="mailto:help.planzo@gmail.com" className="text-indigo-400 hover:text-indigo-300">planzo_help@gmail.com</a> or use our <Link href="/contact" className="text-indigo-400 hover:text-indigo-300">contact form</Link>.</p>
        </LegalSection>
      </LegalProse>
      <Footer></Footer>
    </div>
  );
}





