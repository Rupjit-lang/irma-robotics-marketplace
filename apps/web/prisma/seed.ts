import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed process...')

  // Create buyer organization and user
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@acme.com' },
    update: {},
    create: {
      email: 'buyer@acme.com',
      name: 'John Smith',
      phone: '+91-9876543210'
    }
  })

  const buyerOrg = await prisma.org.upsert({
    where: { id: 'buyer-org-1' },
    update: {},
    create: {
      id: 'buyer-org-1',
      name: 'ACME Manufacturing Ltd',
      gstin: '27AABCU9603R1ZM',
      type: 'BUYER'
    }
  })

  await prisma.membership.upsert({
    where: { 
      userId_orgId: {
        userId: buyerUser.id,
        orgId: buyerOrg.id
      }
    },
    update: {},
    create: {
      userId: buyerUser.id,
      orgId: buyerOrg.id,
      role: 'buyer_admin'
    }
  })

  // Create supplier organizations and users
  const suppliers = [
    {
      userId: 'supplier-user-1',
      userEmail: 'admin@robotech.in',
      userName: 'Rajesh Kumar',
      userPhone: '+91-9123456789',
      orgId: 'supplier-org-1',
      orgName: 'Robotech India Pvt Ltd',
      gstin: '29AABCU9603R1ZX'
    },
    {
      userId: 'supplier-user-2',
      userEmail: 'sales@automate.co.in',
      userName: 'Priya Sharma',
      userPhone: '+91-9234567890',
      orgId: 'supplier-org-2',
      orgName: 'AutoMate Solutions',
      gstin: '07AABCU9603R1ZY'
    }
  ]

  for (const supplier of suppliers) {
    const user = await prisma.user.upsert({
      where: { email: supplier.userEmail },
      update: {},
      create: {
        id: supplier.userId,
        email: supplier.userEmail,
        name: supplier.userName,
        phone: supplier.userPhone
      }
    })

    const org = await prisma.org.upsert({
      where: { id: supplier.orgId },
      update: {},
      create: {
        id: supplier.orgId,
        name: supplier.orgName,
        gstin: supplier.gstin,
        type: 'SUPPLIER'
      }
    })

    await prisma.membership.upsert({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: org.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        orgId: org.id,
        role: 'supplier_admin'
      }
    })

    // Create KYC record (VERIFIED for both suppliers)
    await prisma.kYC.upsert({
      where: { supplierOrgId: org.id },
      update: {},
      create: {
        supplierOrgId: org.id,
        status: 'VERIFIED',
        fields: {
          businessName: supplier.orgName,
          gstin: supplier.gstin,
          panNumber: 'AABCU9603R',
          bankAccount: 'HDFC Bank - ****1234',
          authorizedSignatory: supplier.userName,
          businessAddress: 'Industrial Area Phase II, Chandigarh',
          yearsInBusiness: 8,
          certifications: ['ISO 9001:2015', 'CE Marking'],
          references: [
            'Tata Motors Ltd',
            'Mahindra & Mahindra',
            'Bajaj Auto Ltd'
          ]
        },
        verifiedAt: new Date()
      }
    })
  }

  // Create products for Robotech India
  const robotechProducts = [
    {
      id: 'prod-1',
      category: 'SixAxis',
      title: 'RT-600 Industrial Robot Arm',
      sku: 'RT-600-STD',
      payloadKg: 50.0,
      reachMm: 1200.0,
      repeatabilityMm: 0.05,
      maxSpeedMps: 2.0,
      ipRating: 'IP54',
      controller: 'Siemens S7-1500 PLC',
      priceMinINR: 1800000,
      priceMaxINR: 2200000,
      leadTimeWeeks: 8,
      specs: {
        degreesOfFreedom: 6,
        rotationSpeed: 180, // deg/s
        mounting: 'Floor/Ceiling',
        connectivity: ['Ethernet/IP', 'Profinet'],
        certifications: ['CE', 'ISO 10218'],
        warranty: 24,
        mttrHours: 4,
        operatingTemp: '-10°C to +50°C',
        safetyRating: 'PLd/SIL2',
        programmingInterface: 'Teach Pendant + PC Software',
        serviceTeam: true,
        remoteDiagnostics: true,
        trainingIncluded: true
      }
    },
    {
      id: 'prod-2',
      category: 'SCARA',
      title: 'RT-SCARA-450 Assembly Robot',
      sku: 'RT-SCARA-450',
      payloadKg: 20.0,
      reachMm: 450.0,
      repeatabilityMm: 0.02,
      maxSpeedMps: 3.0,
      ipRating: 'IP65',
      controller: 'ABB AC500 PLC',
      priceMinINR: 850000,
      priceMaxINR: 1100000,
      leadTimeWeeks: 6,
      specs: {
        degreesOfFreedom: 4,
        cycleTime: 0.5, // seconds
        mounting: 'Table/Overhead',
        connectivity: ['EtherCAT', 'Modbus TCP'],
        certifications: ['CE', 'UL Listed'],
        warranty: 18,
        mttrHours: 3,
        operatingTemp: '+5°C to +45°C',
        safetyRating: 'PLc/SIL1',
        programmingInterface: 'HMI + Software',
        serviceTeam: true,
        remoteDiagnostics: true,
        trainingIncluded: true
      }
    },
    {
      id: 'prod-3',
      category: 'AMR',
      title: 'RT-AMR-500 Mobile Robot',
      sku: 'RT-AMR-500',
      payloadKg: 500.0,
      reachMm: null,
      repeatabilityMm: null,
      maxSpeedMps: 1.5,
      ipRating: 'IP54',
      controller: 'Rockwell ControlLogix',
      priceMinINR: 2500000,
      priceMaxINR: 3200000,
      leadTimeWeeks: 12,
      specs: {
        navigation: 'SLAM + LiDAR',
        batteryLife: 8, // hours
        chargingTime: 2, // hours
        dimensions: '1200x800x300 mm',
        connectivity: ['WiFi', 'Bluetooth', 'Ethernet'],
        certifications: ['CE', 'FCC'],
        warranty: 36,
        mttrHours: 6,
        operatingTemp: '0°C to +40°C',
        safetyRating: 'PLd/SIL2',
        fleet_management: true,
        serviceTeam: true,
        remoteDiagnostics: true,
        trainingIncluded: true
      }
    }
  ]

  for (const product of robotechProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        orgId: 'supplier-org-1',
        status: 'LIVE'
      }
    })
  }

  // Create products for AutoMate Solutions  
  const automateProducts = [
    {
      id: 'prod-4',
      category: 'Conveyor',
      title: 'AM-Belt-2400 Conveyor System',
      sku: 'AM-BELT-2400',
      payloadKg: 100.0,
      reachMm: null,
      repeatabilityMm: null,
      maxSpeedMps: 1.0,
      ipRating: 'IP65',
      controller: 'Schneider Modicon M580',
      priceMinINR: 450000,
      priceMaxINR: 650000,
      leadTimeWeeks: 4,
      specs: {
        beltWidth: 600, // mm
        length: 2400, // mm
        motorPower: 2.2, // kW
        driveType: 'Variable Frequency Drive',
        connectivity: ['Modbus RTU', 'Ethernet/IP'],
        certifications: ['CE', 'IS Standards'],
        warranty: 12,
        mttrHours: 2,
        operatingTemp: '+5°C to +60°C',
        beltMaterial: 'PVC/PU',
        frameStainless: true,
        serviceTeam: true,
        remoteDiagnostics: false,
        trainingIncluded: true
      }
    },
    {
      id: 'prod-5',
      category: 'ASRS',
      title: 'AM-ASRS-Mini Automated Storage',
      sku: 'AM-ASRS-MINI',
      payloadKg: 30.0,
      reachMm: 3000.0,
      repeatabilityMm: 1.0,
      maxSpeedMps: 0.8,
      ipRating: 'IP54',
      controller: 'Omron CJ2M PLC',
      priceMinINR: 3500000,
      priceMaxINR: 4500000,
      leadTimeWeeks: 16,
      specs: {
        storagePositions: 200,
        height: 6, // meters
        width: 4, // meters
        depth: 2, // meters
        craneSpeed: 60, // m/min
        liftSpeed: 30, // m/min
        connectivity: ['Ethernet/IP', 'OPC-UA'],
        certifications: ['CE', 'FEM Standards'],
        warranty: 24,
        mttrHours: 8,
        wmsIntegration: true,
        barcodeScanners: true,
        operatingTemp: '+10°C to +40°C',
        serviceTeam: true,
        remoteDiagnostics: true,
        trainingIncluded: true
      }
    },
    {
      id: 'prod-6',
      category: 'Vision',
      title: 'AM-Vision-Pro Inspection System',
      sku: 'AM-VISION-PRO',
      payloadKg: null,
      reachMm: null,
      repeatabilityMm: 0.01,
      maxSpeedMps: null,
      ipRating: 'IP67',
      controller: 'Cognex In-Sight 7000',
      priceMinINR: 280000,
      priceMaxINR: 420000,
      leadTimeWeeks: 3,
      specs: {
        resolution: '2048x1536',
        frameRate: 60, // fps
        lensOptions: ['16mm', '25mm', '50mm'],
        lightingIntegrated: true,
        connectivity: ['Ethernet', 'RS-232', 'Digital I/O'],
        certifications: ['CE', 'FCC'],
        warranty: 12,
        software: 'In-Sight Explorer',
        algorithms: ['OCR', 'Pattern Matching', 'Measurement'],
        operatingTemp: '+0°C to +50°C',
        serviceTeam: false,
        remoteDiagnostics: true,
        trainingIncluded: true
      }
    },
    {
      id: 'prod-7',
      category: 'AGV',
      title: 'AM-AGV-1000 Guided Vehicle',
      sku: 'AM-AGV-1000',
      payloadKg: 1000.0,
      reachMm: null,
      repeatabilityMm: null,
      maxSpeedMps: 1.2,
      ipRating: 'IP54',
      controller: 'Siemens S7-1200',
      priceMinINR: 1800000,
      priceMaxINR: 2400000,
      leadTimeWeeks: 10,
      specs: {
        guidance: 'Magnetic Tape + RFID',
        batteryType: 'Lithium Ion',
        batteryLife: 10, // hours
        chargingTime: 1.5, // hours
        dimensions: '2000x1000x400 mm',
        connectivity: ['WiFi', 'Zigbee'],
        certifications: ['CE', 'IS Standards'],
        warranty: 24,
        mttrHours: 4,
        operatingTemp: '+5°C to +45°C',
        safetyFeatures: ['Emergency Stop', 'Collision Avoidance'],
        fleet_management: false,
        serviceTeam: true,
        remoteDiagnostics: false,
        trainingIncluded: true
      }
    }
  ]

  for (const product of automateProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        orgId: 'supplier-org-2',
        status: 'LIVE'
      }
    })
  }

  // Create some draft products
  await prisma.product.upsert({
    where: { id: 'prod-8' },
    update: {},
    create: {
      id: 'prod-8',
      orgId: 'supplier-org-1',
      category: 'SixAxis',
      title: 'RT-800 Heavy Duty Robot (Draft)',
      sku: 'RT-800-HD',
      payloadKg: 200.0,
      reachMm: 1800.0,
      repeatabilityMm: 0.08,
      maxSpeedMps: 1.5,
      ipRating: 'IP67',
      controller: 'Fanuc R-30iB',
      priceMinINR: 4500000,
      priceMaxINR: 5500000,
      leadTimeWeeks: 20,
      status: 'DRAFT',
      specs: {
        degreesOfFreedom: 6,
        rotationSpeed: 120,
        mounting: 'Floor',
        connectivity: ['DeviceNet', 'Ethernet/IP'],
        certifications: ['CE', 'ISO 10218'],
        warranty: 36
      }
    }
  })

  console.log('✅ Seed data created successfully!')
  console.log('📊 Summary:')
  console.log('   - 1 Buyer organization with 1 user')
  console.log('   - 2 Supplier organizations with 2 users')
  console.log('   - 2 KYC records (both VERIFIED)')
  console.log('   - 7 LIVE products across all categories')
  console.log('   - 1 DRAFT product')
  console.log('   - Products include: 6-Axis Robots, SCARA, AMR, AGV, Conveyor, ASRS, Vision Systems')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })