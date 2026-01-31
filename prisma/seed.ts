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
        // SERVICE 1
        { section: 'SERVICES', key: 'service_1_title', label: 'บริการที่ 1 (หัวข้อ)', value: 'ขออนุมัติโครงการ', type: 'text' },
        { section: 'SERVICES', key: 'service_1_icon', label: 'บริการที่ 1 (ไอคอน)', value: 'FileText', type: 'icon' },
        { section: 'SERVICES', key: 'service_1_desc', label: 'บริการที่ 1 (คำอธิบาย)', value: 'Submit Protocol', type: 'text' },

        // SERVICE 2
        { section: 'SERVICES', key: 'service_2_title', label: 'บริการที่ 2 (หัวข้อ)', value: 'ให้คำปรึกษา', type: 'text' },
        { section: 'SERVICES', key: 'service_2_icon', label: 'บริการที่ 2 (ไอคอน)', value: 'Phone', type: 'icon' },
        { section: 'SERVICES', key: 'service_2_desc', label: 'บริการที่ 2 (คำอธิบาย)', value: 'Consultation', type: 'text' },

        // SERVICE 3
        { section: 'SERVICES', key: 'service_3_title', label: 'บริการที่ 3 (หัวข้อ)', value: 'ติดตามโครงการ', type: 'text' },
        { section: 'SERVICES', key: 'service_3_icon', label: 'บริการที่ 3 (ไอคอน)', value: 'MapPin', type: 'icon' },
        { section: 'SERVICES', key: 'service_3_desc', label: 'บริการที่ 3 (คำอธิบาย)', value: 'Monitoring', type: 'text' },

        // SERVICE 4
        { section: 'SERVICES', key: 'service_4_title', label: 'บริการที่ 4 (หัวข้อ)', value: 'คลังงานวิจัย', type: 'text' },
        { section: 'SERVICES', key: 'service_4_icon', label: 'บริการที่ 4 (ไอคอน)', value: 'BookOpen', type: 'icon' },
        { section: 'SERVICES', key: 'service_4_desc', label: 'บริการที่ 4 (คำอธิบาย)', value: 'Repository', type: 'text' },
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
