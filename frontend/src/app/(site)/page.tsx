import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Handshake,
  Laptop,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PackageSearch,
  Phone,
  ShieldCheck,
  Sprout,
  Tractor,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { JobCard } from '@/components/jobs/JobCard';
import { ContactForm } from '@/components/site/ContactForm';
import { FeaturedPhotos } from '@/components/site/FeaturedPhotos';
import { TestimonialCarousel } from '@/components/site/TestimonialCarousel';
import { publicApi, safely } from '@/lib/api';
import { DEFAULT_SETTINGS, mapEmbedUrl, telLink, whatsappLink } from '@/lib/company';

const SERVICES = [
  {
    icon: Sprout,
    title: 'Agriculture & Farm Supplies',
    text: 'Seeds, fertilizers, agricultural produce, livestock, farming equipment, and other agricultural inputs.',
  },
  {
    icon: GraduationCap,
    title: 'Education & Institutional Supplies',
    text: 'School desks, furniture, stationery, learning materials, computers, and other institutional requirements.',
  },
  {
    icon: Laptop,
    title: 'Technology & Office Equipment',
    text: 'Computers, printers, accessories, office equipment, and technology-related supplies.',
  },
  {
    icon: Tractor,
    title: 'Machinery & Equipment',
    text: 'Agricultural machinery, tools, equipment, and other operational requirements.',
  },
  {
    icon: Package,
    title: 'General Procurement & Supplies',
    text: 'A wide range of products sourced according to the specific needs of businesses, institutions, organizations, and other customers.',
  },
  {
    icon: Handshake,
    title: 'Business & Investment',
    text: 'Strategic investments, commercial opportunities, partnerships, and ventures across different sectors.',
  },
];

const SECTORS = [
  {
    title: 'Farms & Agricultural Projects',
    text: 'Inputs, equipment, and produce supply that keep productive operations moving.',
  },
  {
    title: 'Schools & Education',
    text: 'Desks, furniture, stationery, and learning materials for classrooms.',
  },
  {
    title: 'Organizations & Offices',
    text: 'Computers, printers, and office equipment for day-to-day operations.',
  },
  {
    title: 'Businesses & Institutions',
    text: 'General supplies and procurement tailored to each requirement.',
  },
];

const HOW_WE_WORK = [
  {
    icon: ClipboardList,
    title: 'Request',
    text: 'Tell us what you need: items, quantities, and delivery location. We listen carefully to understand your context and priorities.',
  },
  {
    icon: FileText,
    title: 'Quotation',
    text: 'We prepare a clear quotation and align requirements, pricing, and timelines with you before anything is ordered.',
  },
  {
    icon: PackageSearch,
    title: 'Sourcing',
    text: 'We source the right products through reliable suppliers and coordinate every step with a disciplined rhythm.',
  },
  {
    icon: Truck,
    title: 'Delivery',
    text: 'We deliver to your location and follow through, staying accountable for a dependable outcome.',
  },
];

export default async function HomePage() {
  const [jobs, photos, fetchedSettings, testimonials, partners, projects] = await Promise.all([
    safely(publicApi.jobs(), []),
    safely(publicApi.photos(), []),
    safely(publicApi.settings(), DEFAULT_SETTINGS),
    safely(publicApi.testimonials(), []),
    safely(publicApi.partners(), []),
    safely(publicApi.projects(), []),
  ]);
  const settings = { ...DEFAULT_SETTINGS, ...fetchedSettings };
  // Rotate through photos marked "Feature on home page"; if fewer than 3 are
  // featured, fall back to the whole gallery so the section always has motion.
  const featuredPhotos = photos.filter((p) => p.featured);
  const photoPool = featuredPhotos.length >= 3 ? featuredPhotos : photos;

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-stone-50 text-ink-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,75,56,0.05),transparent_35%)]" />
        <div className="container-page relative grid items-center gap-12 py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            <span className="section-tag">Registered Supplier · Lilongwe, Malawi</span>
            <h1 className="mt-4 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
              Reliable Supply for Every Need.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Hacama Investments is a diversified investment, procurement, and supply company providing products and
              services to institutions, businesses, organizations, farmers, and communities across Malawi.
            </p>
            <p className="mt-4 max-w-xl text-slate-600">
              From agricultural inputs and produce to office equipment, school furniture, computers, machinery, and
              general supplies, we connect our customers with the products they need through reliable sourcing and
              dependable service.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#services" className="btn btn-primary">
                Explore Our Services
              </Link>
              <Link href="/#contact" className="btn btn-secondary">
                Contact Us
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-600">
              {['Registered supplier', 'Lilongwe-based', 'Multi-sector supply'].map((t) => (
                <span key={t} className="rounded-full border border-slate-300 bg-white px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">One partner, every need</p>
              <h2 className="mt-3 text-2xl font-semibold">
                Procurement, supply, and investment under one business.
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                <li>Registered supplier recognized by PPDA</li>
                <li>Agriculture, education, technology, and general supplies</li>
                <li>Reliable sourcing and dependable service</li>
              </ul>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Lilongwe Based', "Grounded in Malawi's capital, serving customers nationwide"],
                ['Registered Supplier', 'Recognized for public procurement and institutional supply'],
                ['Multi-Sector', 'From farm inputs to office equipment and beyond'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <strong className="block text-sm text-ink-950">{title}</strong>
                  <span className="mt-1 block text-xs text-slate-500">{text}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {settings.stats.length > 0 && (
        <section className="border-b border-slate-200 bg-white" aria-label="Key numbers">
          <dl className="container-page grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
            {settings.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse text-center">
                <dt className="mt-1 text-sm text-slate-600">{stat.label}</dt>
                <dd className="text-3xl font-bold tracking-tight text-brand-600 sm:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {partners.length > 0 && (
        <section className="border-b border-slate-200 bg-white py-10" aria-label="Clients and partners">
          <div className="container-page">
            <p className="text-center text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Trusted by organizations across Malawi
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
              {partners.map((partner) => {
                const content = partner.imageUrl ? (
                  <Image
                    src={partner.imageUrl}
                    alt={partner.name}
                    title={partner.name}
                    width={160}
                    height={48}
                    className="h-12 w-auto max-w-40 object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-500">{partner.name}</span>
                );
                return (
                  <li key={partner._id}>
                    {partner.website ? (
                      <a href={partner.website} target="_blank" rel="noreferrer">
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <section id="about" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <span className="section-tag">About Hacama Investments</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
              More Than Supply. We Build Connections.
            </h2>
            <div className="mt-8 flex max-w-md items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Image
                src="/ppda-logo.png"
                alt="Public Procurement and Disposal of Assets Authority"
                width={200}
                height={48}
                className="h-12 w-auto object-contain"
              />
              <div>
                <p className="text-sm font-semibold text-ink-950">Registered Supplier</p>
                <p className="text-xs text-slate-500">
                  Recognized by the Public Procurement &amp; Disposal of Assets Authority (PPDA)
                </p>
              </div>
            </div>
            {settings.credentials.length > 0 && (
              <ul className="mt-4 max-w-md space-y-2">
                {settings.credentials.map((c) => (
                  <li
                    key={c.title}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  >
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    <span>
                      <span className="font-medium text-ink-950">{c.title}</span>
                      {c.detail && <span className="block text-slate-500">{c.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {settings.companyProfileUrl && (
              <a href={settings.companyProfileUrl} target="_blank" rel="noreferrer" className="btn btn-outline mt-6">
                <Download className="size-4" /> Download company profile (PDF)
              </a>
            )}
          </div>
          <div className="space-y-4 text-slate-600">
            <p>
              Hacama Investments brings together procurement, agricultural supply, general trading, and investment under
              one business.
            </p>
            <p>
              Our role is simple: understand what our customers need, source the right products, and deliver them
              reliably.
            </p>
            <p>
              Whether it is farm inputs for an agricultural project, desks and learning materials for a school, computers
              and equipment for an organization, or machinery and supplies for a business, we are positioned to serve a
              wide range of procurement needs.
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="section-tag">What We Supply</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
              Products and services across every sector we serve.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <article key={s.title} className="card flex flex-col p-6">
                <div className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <s.icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink-950">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{s.text}</p>
                <Link
                  href={`/quote?category=${encodeURIComponent(s.title)}`}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  Request a quote <ArrowRight className="size-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sectors" className="scroll-mt-20 bg-slate-100 py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <span className="section-tag">Who We Serve</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
              One Partner. Multiple Solutions.
            </h2>
            <p className="mt-4 text-slate-600">
              At Hacama Investments, we don&apos;t limit ourselves to one industry or product category. Our strength is our
              ability to source, coordinate, and supply.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SECTORS.map((s) => (
              <article key={s.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-ink-950">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-we-work" className="scroll-mt-20 py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="section-tag">How We Work</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">
                From request to delivery in four clear steps.
              </h2>
            </div>
            <Link href="/quote" className="btn btn-primary">
              Request a Quote <ArrowRight className="size-4" />
            </Link>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOW_WE_WORK.map((step, i) => (
              <li key={step.title} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <step.icon className="size-5" />
                  </span>
                  <span className="text-sm font-bold text-slate-300">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink-950">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {projects.length > 0 && (
        <section id="projects" className="scroll-mt-20 bg-slate-50 py-20">
          <div className="container-page">
            <div className="max-w-2xl">
              <span className="section-tag">Past Projects</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">Work we have delivered.</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article key={project._id} className="card overflow-hidden">
                  {project.imageUrl && (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      width={800}
                      height={500}
                      className="aspect-[16/10] w-full object-cover"
                    />
                  )}
                  <div className="p-6">
                    {(project.category || project.year) && (
                      <p className="text-xs font-semibold tracking-wider text-brand-600 uppercase">
                        {[project.category, project.year].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <h3 className="mt-2 text-lg font-semibold text-ink-950">{project.title}</h3>
                    {project.client && <p className="mt-1 text-sm text-slate-500">{project.client}</p>}
                    {project.summary && <p className="mt-3 text-sm text-slate-600">{project.summary}</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section id="testimonials" className="scroll-mt-20 py-20">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="section-tag">Testimonials</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">What our customers say.</h2>
              </div>
              <Link href="/testimonials" className="btn btn-outline">
                All testimonials <ArrowRight className="size-4" />
              </Link>
            </div>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="section-tag">Careers</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">Latest openings</h2>
            </div>
            <Link href="/jobs" className="btn btn-outline">
              All jobs <ArrowRight className="size-4" />
            </Link>
          </div>
          {jobs.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.slice(0, 3).map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              No open positions right now. Please check back soon.
            </p>
          )}
        </div>
      </section>

      {photoPool.length > 0 && (
        <section className="py-20">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="section-tag">Gallery</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">Moments from our work</h2>
              </div>
              <Link href="/gallery" className="btn btn-outline">
                View gallery <ArrowRight className="size-4" />
              </Link>
            </div>
            <FeaturedPhotos photos={photoPool} />
          </div>
        </section>
      )}

      {settings.faqs.length > 0 && (
        <section id="faq" className="scroll-mt-20 py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <span className="section-tag">FAQ</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">Frequently asked questions.</h2>
              <p className="mt-4 text-slate-600">
                Can&apos;t find what you are looking for?{' '}
                <Link href="/#contact" className="font-medium text-brand-600 hover:underline">
                  Get in touch
                </Link>
                .
              </p>
            </div>
            <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {settings.faqs.map((faq) => (
                <details key={faq.question} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-950 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown className="size-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm whitespace-pre-line text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="contact" className="scroll-mt-20 bg-slate-50 py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="section-tag">Contact</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">Open the door to your next conversation.</h2>
            <p className="mt-4 text-slate-600">
              Need pricing for specific items?{' '}
              <Link href="/quote" className="font-medium text-brand-600 hover:underline">
                Request a quote
              </Link>{' '}
              instead.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-start gap-3 text-slate-600">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {settings.address || 'Lilongwe, Malawi'}
              </li>
              {settings.phone && (
                <li>
                  <a href={telLink(settings.phone)} className="flex items-center gap-3 text-slate-600 hover:text-brand-600">
                    <Phone className="size-4 shrink-0 text-brand-600" /> {settings.phone}
                  </a>
                </li>
              )}
              {settings.whatsapp && (
                <li>
                  <a
                    href={whatsappLink(settings.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-slate-600 hover:text-brand-600"
                  >
                    <MessageCircle className="size-4 shrink-0 text-brand-600" /> WhatsApp {settings.whatsapp}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-slate-600 hover:text-brand-600">
                    <Mail className="size-4 shrink-0 text-brand-600" /> {settings.email}
                  </a>
                </li>
              )}
              {settings.officeHours && (
                <li className="flex items-start gap-3 text-slate-600">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brand-600" /> {settings.officeHours}
                </li>
              )}
            </ul>
            {settings.address && (
              <iframe
                title="Office location map"
                src={mapEmbedUrl(settings.address)}
                className="mt-8 h-64 w-full rounded-2xl border border-slate-200"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
