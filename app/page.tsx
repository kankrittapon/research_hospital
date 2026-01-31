import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { FileText, Users, Trophy, ArrowRight, Activity, Calendar, Download, Search, BookOpen, Database, Phone, MapPin, User, Home as HomeIcon, Info, Mail, Layout, CloudLightning, ChevronRight, Facebook, Youtube, Globe } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SearchBox } from "@/components/search-box";
import { NavbarActions } from "@/components/navbar-actions";
import prisma from "@/lib/db";

// Icon Mapping
const ICON_MAP: Record<string, any> = {
  FileText, Phone, MapPin, BookOpen, User, Home: HomeIcon, Info, Mail, Layout, CloudLightning,
  Users, Trophy, Activity, Calendar, Download, Search, Database // Extras
};

async function getSiteConfig() {
  const contents = await prisma.siteContent.findMany();
  // Transform array to key-value object
  const config = contents.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    hero: {
      title: config['hero_title'] || "สำนักงานส่งเสริมวิจัย",
      subtitle: config['hero_subtitle'] || "ศูนย์กลางข้อมูลงานวิจัยและนวัตกรรมทางการแพทย์ เพื่อการพัฒนาที่ยั่งยืน สนับสนุนบุคลากรในการสร้างองค์ความรู้ใหม่ตามมาตรฐานสากล",
      banner: config['hero_banner'] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop",
    },
    about: {
      title: config['about_title'] || "สำนักงานส่งเสริมวิจัย กรมแพทย์ทหารเรือ",
      desc: config['about_desc'] || "วัตถุประสงค์เพื่อส่งเสริม สนับสนุน และประสานงานด้านการวิจัย นวัตกรรม และสิ่งประดิษฐ์ทางการแพทย์ รวมถึงให้บริการทางวิชาการ เพื่อยกระดับมาตรฐานการรักษาพยาบาลและสุขภาพของกำลังพลและประชาชน",
    },
    contact: {
      address: config['contact_address'] || "กรมแพทย์ทหารเรือ ถนนสมเด็จพระเจ้าตากสิน แขวงบุคคโล เขตธนบุรี กรุงเทพมหานคร 10600",
      phone: config['contact_phone'] || "02-123-4567",
      website: config['contact_website'] || "www.nmd.go.th",
    },
    theme: {
      primary: config['theme_color'] || "#2563eb", // blue-600 defaults
    },
    services: [
      {
        title: config['service_1_title'] || "ขออนุมัติโครงการ",
        icon: config['service_1_icon'] || "FileText",
        desc: config['service_1_desc'] || "Submit Protocol",
        href: "#"
      },
      {
        title: config['service_2_title'] || "ให้คำปรึกษา",
        icon: config['service_2_icon'] || "Phone",
        desc: config['service_2_desc'] || "Consultation",
        href: "#"
      },
      {
        title: config['service_3_title'] || "ติดตามโครงการ",
        icon: config['service_3_icon'] || "MapPin",
        desc: config['service_3_desc'] || "Monitoring",
        href: "#"
      },
      {
        title: config['service_4_title'] || "คลังงานวิจัย",
        icon: config['service_4_icon'] || "BookOpen",
        desc: config['service_4_desc'] || "Repository",
        href: "/repository"
      },
    ]
  };
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  const config = await getSiteConfig();

  // Helper to ensure color is valid or fallback
  const primaryColor = config.theme.primary;

  return (
    <div className="min-h-screen bg-slate-50 font-sans" style={{ '--primary': primaryColor } as React.CSSProperties}>

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight" style={{ color: primaryColor }}>สำนักงานส่งเสริมวิจัย</h1>
              <p className="text-xs text-slate-500">Research Promotion Office</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-[var(--primary)] transition-colors">หน้าแรก</Link>
            <Link href="#about" className="hover:text-[var(--primary)] transition-colors">เกี่ยวกับเรา</Link>
            <Link href="/repository" className="hover:text-[var(--primary)] transition-colors">คลังงานวิจัย</Link>
            <Link href="#services" className="hover:text-[var(--primary)] transition-colors">บริการของเรา</Link>
            <Link href="#" className="hover:text-[var(--primary)] transition-colors">ดาวน์โหลด</Link>
            <Link href="#contact" className="hover:text-[var(--primary)] transition-colors">ติดต่อสอบถาม</Link>
          </nav>

          <div className="flex items-center gap-3">
            <NavbarActions user={session?.user} />
            <Button className="rounded-full shadow-lg hover:shadow-xl transition-all text-white" style={{ backgroundColor: primaryColor }} asChild>
              <Link href="/upload">ส่งงานวิจัย</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center bg-slate-900">
        <div
          className="absolute inset-0 opacity-40 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('${config.hero.banner}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />

        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
            <Badge className="bg-yellow-400 text-yellow-950 border-none px-4 py-1.5 text-sm font-bold shadow-lg shadow-yellow-400/20 hover:bg-yellow-500">
              Sirikit Hospital
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-md">
              {config.hero.title}
            </h1>
            <p className="text-xl text-slate-200 max-w-2xl font-light leading-relaxed">
              {config.hero.subtitle}
            </p>
            <div className="mt-8 pt-4 relative w-full max-w-xl">
              <SearchBox />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Links Bar */}
      <section className="text-white relative z-20 shadow-lg" style={{ backgroundColor: primaryColor }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
            {[
              { label: "ขั้นตอนการส่งวิจัย", icon: FileText, href: "#" },
              { label: "แบบฟอร์ม", icon: BookOpen, href: "#" },
              { label: "ทุนวิจัย", icon: Trophy, href: "#" }, // Changed Phone -> Trophy for variety
              session
                ? { label: "ระบบจัดการ", icon: User, href: "/dashboard" }
                : { label: "เข้าสู่ระบบ", icon: User, href: "/login" },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center justify-center gap-3 py-6 hover:bg-black/10 transition-colors cursor-pointer group">
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="font-medium text-lg">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. About Section */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[var(--primary)] text-sm font-semibold">
              <Activity className="h-4 w-4" />
              <span>About Us</span>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              {config.about.title}
            </h2>
            <div className="w-24 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            <p className="text-lg text-slate-600 leading-relaxed">
              {config.about.desc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {[
                "ส่งเสริมงานวิจัยที่มีคุณภาพ",
                "ให้บริการทางวิชาการ",
                "พัฒนาศักยภาพนักวิจัย",
                "ยกระดับมาตรฐานสุขภาพ"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                  {item}
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button variant="outline" className="h-12 px-8 rounded-full text-base border-slate-200 hover:bg-slate-50 hover:text-[var(--primary)]" asChild>
                <Link href="#">อ่านเพิ่มเติม <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1600&auto=format&fit=crop"
                alt="About"
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Services Section */}
      <section id="services" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center mb-16">
          <span className="font-bold tracking-wider text-sm uppercase" style={{ color: primaryColor }}>Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">บริการด้านงานวิจัย</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">เรามีบริการที่ครอบคลุมเพื่อสนับสนุนการทำงานวิจัยของคุณให้ราบรื่นและมีประสิทธิภาพ</p>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {config.services.map((item, i) => {
              const IconComp = ICON_MAP[item.icon];
              return (
                <Link key={i} href={item.href}>
                  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-blue-100 h-full flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-600 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-lg overflow-hidden">
                      {IconComp ? (
                        <IconComp className="h-8 w-8" />
                      ) : (
                        // Fallback for custom uploaded icons
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.icon} alt={item.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-[var(--primary)] transition-colors">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. News Section (Optional placeholder) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">ข่าวสารล่าสุด</h2>
              <p className="text-slate-500 mt-2">ติดตามความเคลื่อนไหวและกิจกรรมต่างๆ</p>
            </div>
            <Button variant="ghost" className="text-[var(--primary)]">ดูทั้งหมด <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <Card key={n} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group border-slate-100">
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWVkaWNhbHxlbnwwfHwwfHx8MA%3D%3D`}
                    alt="news"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-[var(--primary)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    News
                  </div>
                </div>
                <CardHeader>
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                    ขอเชิญเข้าร่วมอบรมเชิงปฏิบัติการ การเขียนโครงร่างงานวิจัย ประจำปี 2569
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                    <Calendar className="h-3 w-3" /> 28 ม.ค. 2569
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    อบรมเพื่อพัฒนาศักยภาพบุคลากรในการทำวิจัย ให้ถูกต้องตามหลักวิชาการและจริยธรรมการวิจัยในมนุษย์
                  </p>
                </CardContent>
                <CardFooter>
                  <span className="text-sm font-semibold text-[var(--primary)] flex items-center group-hover:translate-x-1 transition-transform cursor-pointer">
                    อ่านต่อ <ArrowRight className="ml-1 h-3 w-3" />
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white text-lg font-bold">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: primaryColor }}>
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Research Promotion
              </div>
              <p className="leading-relaxed text-slate-500">
                มุ่งมั่นยกระดับงานวิจัยทางการแพทย์สู่มาตรฐานสากล <br />
                เพื่อคุณภาพชีวิตที่ดีกว่าของทุกคน
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold text-base mb-2">ที่อยู่ติดต่อ</h4>
              <p>{config.contact.address}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold text-base mb-2">ข้อมูลการติดต่อ</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" style={{ color: primaryColor }} /> {config.contact.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" style={{ color: primaryColor }} /> {config.contact.website}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" style={{ color: primaryColor }} /> admin@sirikit.com
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-600">
            <p>&copy; {new Date().getFullYear()} Sirikit Hospital Research Promotion Office. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
