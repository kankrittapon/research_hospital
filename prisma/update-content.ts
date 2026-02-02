
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const newContents = [
        // MENU / NAVIGATION
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
    ]

    for (const item of newContents) {
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
    console.log('Content updated successfully')
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
