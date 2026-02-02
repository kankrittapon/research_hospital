import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 1. Seed Admin User (Upsert)
    const password = await bcrypt.hash('admin123', 10)

    await prisma.user.upsert({
        where: { email: 'admin@sirikit.com' },
        update: {},
        create: {
            email: 'admin@sirikit.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
        },
    })

    // 2. Seed Initial Site Content
    const contents = [
        // THEME
        { section: 'THEME', key: 'theme_color', label: 'สีหลักของเว็บไซต์ (Theme Color)', value: '#2563eb', type: 'color' }, // Blue-600

        // IMAGES
        { section: 'IMAGES', key: 'hero_banner', label: 'รูปภาพ Banner หน้าแรก', value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop', type: 'image' },

        // HOME HERO
        { section: 'HOME_HERO', key: 'hero_title', label: 'หัวข้อหลัก (Hero Title)', value: 'สำนักงานส่งเสริมวิจัย', type: 'text' },
        { section: 'HOME_HERO', key: 'hero_subtitle', label: 'คำโปรย (Hero Subtitle)', value: 'ศูนย์กลางข้อมูลงานวิจัยและนวัตกรรมทางการแพทย์ เพื่อการพัฒนาที่ยั่งยืน สนับสนุนบุคลากรในการสร้างองค์ความรู้ใหม่ตามมาตรฐานสากล', type: 'textarea' },

        // ABOUT
        { section: 'ABOUT', key: 'about_title', label: 'หัวข้อเซคชั่นเกี่ยวกับเรา', value: 'สำนักงานส่งเสริมวิจัย กรมแพทย์ทหารเรือ', type: 'text' },
        { section: 'ABOUT', key: 'about_desc', label: 'รายละเอียดเกี่ยวกับเรา', value: 'วัตถุประสงค์เพื่อส่งเสริม สนับสนุน และประสานงานด้านการวิจัย นวัตกรรม และสิ่งประดิษฐ์ทางการแพทย์ รวมถึงให้บริการทางวิชาการ เพื่อยกระดับมาตรฐานการรักษาพยาบาลและสุขภาพของกำลังพลและประชาชน', type: 'textarea' },

        // CONTACT
        { section: 'CONTACT', key: 'contact_address', label: 'ที่อยู่', value: 'กรมแพทย์ทหารเรือ ถนนสมเด็จพระเจ้าตากสิน แขวงบุคคโล เขตธนบุรี กรุงเทพมหานคร 10600', type: 'textarea' },
        { section: 'CONTACT', key: 'contact_phone', label: 'เบอร์โทรศัพท์', value: '02-123-4567', type: 'text' },
        { section: 'CONTACT', key: 'contact_website', label: 'เว็บไซต์', value: 'www.nmd.go.th', type: 'text' },
    ]

    // Add new services separately to avoid type issues if needed, or just append to list
    const services = [
        // NAV (Menu)
        { section: 'NAV', key: 'nav_home', label: 'เมนู: หน้าแรก', value: 'หน้าแรก', type: 'text' },
        { section: 'NAV', key: 'nav_about', label: 'เมนู: เกี่ยวกับเรา', value: 'เกี่ยวกับเรา', type: 'text' },
        { section: 'NAV', key: 'nav_repo', label: 'เมนู: คลังงานวิจัย', value: 'คลังงานวิจัย', type: 'text' },
        { section: 'NAV', key: 'nav_news', label: 'เมนู: ข่าวสาร', value: 'ข่าวสาร', type: 'text' },
        { section: 'NAV', key: 'nav_services', label: 'เมนู: บริการของเรา', value: 'บริการของเรา', type: 'text' },
        { section: 'NAV', key: 'nav_download', label: 'เมนู: ดาวน์โหลด', value: 'ดาวน์โหลด', type: 'text' },
        { section: 'NAV', key: 'nav_contact', label: 'เมนู: ติดต่อสอบถาม', value: 'ติดต่อสอบถาม', type: 'text' },

        // ABOUT US - ENHANCED
        { section: 'ABOUT', key: 'about_image', label: 'รูปภาพประกอบ (About Image)', value: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1600&auto=format&fit=crop', type: 'image' },
        { section: 'ABOUT', key: 'about_link_text', label: 'ข้อความปุ่มลิ้งค์', value: 'อ่านเพิ่มเติม', type: 'text' },
        { section: 'ABOUT', key: 'about_link_url', label: 'ลิ้งค์ปุ่ม (URL)', value: '#', type: 'text' },
        
        // ABOUT US - BULLETS
        { section: 'ABOUT', key: 'about_bullet_1', label: 'จุดเด่นที่ 1', value: 'ส่งเสริมงานวิจัยที่มีคุณภาพ', type: 'text' },
        { section: 'ABOUT', key: 'about_bullet_2', label: 'จุดเด่นที่ 2', value: 'ให้บริการทางวิชาการ', type: 'text' },
        { section: 'ABOUT', key: 'about_bullet_3', label: 'จุดเด่นที่ 3', value: 'พัฒนาศักยภาพนักวิจัย', type: 'text' },
        { section: 'ABOUT', key: 'about_bullet_4', label: 'จุดเด่นที่ 4', value: 'ยกระดับมาตรฐานสุขภาพ', type: 'text' },

        // SERVICE 1: Submit Protocol
        { section: 'SERVICES', key: 'service_1_title', label: 'บริการที่ 1 (หัวข้อ)', value: 'ขออนุมัติโครงการ', type: 'text' },
        { section: 'SERVICES', key: 'service_1_icon', label: 'บริการที่ 1 (ไอคอน)', value: 'FileText', type: 'icon' },
        { section: 'SERVICES', key: 'service_1_image', label: 'บริการที่ 1 (รูปภาพ)', value: '', type: 'image' },
        { section: 'SERVICES', key: 'service_1_desc', label: 'บริการที่ 1 (คำอธิบาย)', value: 'Submit Protocol', type: 'text' },
        { section: 'SERVICES', key: 'service_1_url', label: 'บริการที่ 1 (ลิงก์ปลายทาง)', value: '#', type: 'text' },
        { section: 'SERVICES', key: 'service_1_detail', label: 'บริการที่ 1 (รายละเอียด Popup)', value: '1. ยื่นแบบฟอร์มขออนุมัติ\n2. รอการตรวจสอบจากคณะกรรมการ\n3. แก้ไขตามข้อเสนอแนะ\n4. รับใบรับรอง', type: 'textarea' },

        // SERVICE 2: Consultation
        { section: 'SERVICES', key: 'service_2_title', label: 'บริการที่ 2 (หัวข้อ)', value: 'ให้คำปรึกษา', type: 'text' },
        { section: 'SERVICES', key: 'service_2_icon', label: 'บริการที่ 2 (ไอคอน)', value: 'Phone', type: 'icon' },
        { section: 'SERVICES', key: 'service_2_image', label: 'บริการที่ 2 (รูปภาพ)', value: '', type: 'image' },
        { section: 'SERVICES', key: 'service_2_desc', label: 'บริการที่ 2 (คำอธิบาย)', value: 'Consultation', type: 'text' },
        { section: 'SERVICES', key: 'service_2_url', label: 'บริการที่ 2 (ลิงก์ปลายทาง)', value: '#', type: 'text' },
        { section: 'SERVICES', key: 'service_2_detail', label: 'บริการที่ 2 (รายละเอียด Popup)', value: 'ให้บริการคำปรึกษาด้านระเบียบวิธีวิจัยและสถิติ', type: 'textarea' },

        // SERVICE 3: Monitoring
        { section: 'SERVICES', key: 'service_3_title', label: 'บริการที่ 3 (หัวข้อ)', value: 'ติดตามโครงการ', type: 'text' },
        { section: 'SERVICES', key: 'service_3_icon', label: 'บริการที่ 3 (ไอคอน)', value: 'MapPin', type: 'icon' },
        { section: 'SERVICES', key: 'service_3_image', label: 'บริการที่ 3 (รูปภาพ)', value: '', type: 'image' },
        { section: 'SERVICES', key: 'service_3_desc', label: 'บริการที่ 3 (คำอธิบาย)', value: 'Monitoring', type: 'text' },
        { section: 'SERVICES', key: 'service_3_url', label: 'บริการที่ 3 (ลิงก์ปลายทาง)', value: '/dashboard/my-projects', type: 'text' },
        { section: 'SERVICES', key: 'service_3_detail', label: 'บริการที่ 3 (รายละเอียด Popup)', value: 'ติดตามความก้าวหน้าโครงการวิจัยทุก 6 เดือน', type: 'textarea' },

        // SERVICE 4: Repository
        { section: 'SERVICES', key: 'service_4_title', label: 'บริการที่ 4 (หัวข้อ)', value: 'คลังงานวิจัย', type: 'text' },
        { section: 'SERVICES', key: 'service_4_icon', label: 'บริการที่ 4 (ไอคอน)', value: 'BookOpen', type: 'icon' },
        { section: 'SERVICES', key: 'service_4_image', label: 'บริการที่ 4 (รูปภาพ)', value: '', type: 'image' },
        { section: 'SERVICES', key: 'service_4_desc', label: 'บริการที่ 4 (คำอธิบาย)', value: 'Repository', type: 'text' },
        { section: 'SERVICES', key: 'service_4_url', label: 'บริการที่ 4 (ลิงก์ปลายทาง)', value: '/repository', type: 'text' },
        { section: 'SERVICES', key: 'service_4_detail', label: 'บริการที่ 4 (รายละเอียด Popup)', value: 'สืบค้นข้อมูลงานวิจัยที่ได้รับการตีพิมพ์แล้ว', type: 'textarea' },
    ]

    // Combine arrays
    const allContents = [...contents, ...services]

    for (const item of allContents) {
        await prisma.siteContent.upsert({
            where: { key: item.key },
            update: {
                label: item.label,
                type: item.type,
                section: item.section
            },
            create: item
        })
    }
    console.log('Site Content (inc. Theme/Images) seeded')

    // 3. Seed News
    const news = [
        {
            title: 'ขอเชิญเข้าร่วมอบรมเชิงปฏิบัติการ การเขียนโครงร่างงานวิจัย ประจำปี 2569',
            content: 'รายละเอียดการอบรม... (ตัวอย่างเนื้อหาข่าว) เพื่อพัฒนาศักยภาพบุคลากรทางการแพทย์ในการทำวิจัยอย่างมีคุณภาพ',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=2070',
            published: true,
            publishDate: new Date()
        },
        {
            title: 'ประกาศทุนอุดหนุนการวิจัย ประจำปีงบประมาณ 2569',
            content: 'สำนักงานส่งเสริมวิจัย เปิดรับข้อเสนอโครงการวิจัยเพื่อขอรับทุนอุดหนุนการวิจัย...',
            published: true,
            publishDate: new Date(Date.now() - 86400000) // Yesterday
        }
    ]

    for (const item of news) {
        // Simple check to avoid duplicates based on title for seeding
        const existing = await prisma.news.findFirst({ where: { title: item.title } })
        if (!existing) {
            await prisma.news.create({ data: item })
        }
    }
    console.log('News seeded')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
