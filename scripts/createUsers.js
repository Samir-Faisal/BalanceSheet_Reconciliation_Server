require("dotenv").config();

const bcrypt = require("bcryptjs");

const {
  connectDatabase,
  getDatabase,
  closeDatabase,
} = require("../config/database");

// ============================================
// INITIAL USERS FROM RECONCILIATION DATASET
// ============================================

const users = [
  // ======================
  // ADMINS
  // ======================

  {
    userId: "U001",
    name: "James Wilson",
    username: "james.wilson",
    email: "james.wilson@reconciliation.com",
    role: "ADMIN",
    department: "Finance Administration",
    status: "ACTIVE",
  },
  {
    userId: "U002",
    name: "Sarah Miller",
    username: "sarah.miller",
    email: "sarah.miller@reconciliation.com",
    role: "ADMIN",
    department: "Finance Administration",
    status: "ACTIVE",
  },
  {
    userId: "U003",
    name: "Daniel Cooper",
    username: "daniel.cooper",
    email: "daniel.cooper@reconciliation.com",
    role: "ADMIN",
    department: "IT & Finance Systems",
    status: "ACTIVE",
  },

  // ======================
  // PREPARERS
  // ======================

  {
    userId: "U004",
    name: "Ahmed Khan",
    username: "ahmed.khan",
    email: "ahmed.khan@reconciliation.com",
    role: "PREPARER",
    department: "Accounts Payable",
    status: "ACTIVE",
  },
  {
    userId: "U005",
    name: "Emily Brown",
    username: "emily.brown",
    email: "emily.brown@reconciliation.com",
    role: "PREPARER",
    department: "Accounts Payable",
    status: "ACTIVE",
  },
  {
    userId: "U006",
    name: "Michael Taylor",
    username: "michael.taylor",
    email: "michael.taylor@reconciliation.com",
    role: "PREPARER",
    department: "Accounts Payable",
    status: "ACTIVE",
  },
  {
    userId: "U007",
    name: "Olivia Smith",
    username: "olivia.smith",
    email: "olivia.smith@reconciliation.com",
    role: "PREPARER",
    department: "Accounts Receivable",
    status: "ACTIVE",
  },
  {
    userId: "U008",
    name: "William Jones",
    username: "william.jones",
    email: "william.jones@reconciliation.com",
    role: "PREPARER",
    department: "Accounts Receivable",
    status: "ACTIVE",
  },
  {
    userId: "U009",
    name: "Sophia Davis",
    username: "sophia.davis",
    email: "sophia.davis@reconciliation.com",
    role: "PREPARER",
    department: "Accounts Receivable",
    status: "ACTIVE",
  },
  {
    userId: "U010",
    name: "Noah Wilson",
    username: "noah.wilson",
    email: "noah.wilson@reconciliation.com",
    role: "PREPARER",
    department: "General Accounting",
    status: "ACTIVE",
  },
  {
    userId: "U011",
    name: "Amelia Moore",
    username: "amelia.moore",
    email: "amelia.moore@reconciliation.com",
    role: "PREPARER",
    department: "General Accounting",
    status: "ACTIVE",
  },
  {
    userId: "U012",
    name: "Jack Thomas",
    username: "jack.thomas",
    email: "jack.thomas@reconciliation.com",
    role: "PREPARER",
    department: "General Accounting",
    status: "ACTIVE",
  },
  {
    userId: "U013",
    name: "Isla Martin",
    username: "isla.martin",
    email: "isla.martin@reconciliation.com",
    role: "PREPARER",
    department: "Tax & Compliance",
    status: "ACTIVE",
  },
  {
    userId: "U014",
    name: "George White",
    username: "george.white",
    email: "george.white@reconciliation.com",
    role: "PREPARER",
    department: "Treasury",
    status: "ACTIVE",
  },
  {
    userId: "U015",
    name: "Grace Harris",
    username: "grace.harris",
    email: "grace.harris@reconciliation.com",
    role: "PREPARER",
    department: "Financial Control",
    status: "ACTIVE",
  },

  // ======================
  // REVIEWERS
  // ======================

  {
    userId: "U016",
    name: "Oliver Clark",
    username: "oliver.clark",
    email: "oliver.clark@reconciliation.com",
    role: "REVIEWER",
    department: "Financial Control",
    status: "ACTIVE",
  },
  {
    userId: "U017",
    name: "Mia Lewis",
    username: "mia.lewis",
    email: "mia.lewis@reconciliation.com",
    role: "REVIEWER",
    department: "Financial Control",
    status: "ACTIVE",
  },
  {
    userId: "U018",
    name: "Henry Walker",
    username: "henry.walker",
    email: "henry.walker@reconciliation.com",
    role: "REVIEWER",
    department: "Internal Audit",
    status: "ACTIVE",
  },
  {
    userId: "U019",
    name: "Ella Hall",
    username: "ella.hall",
    email: "ella.hall@reconciliation.com",
    role: "REVIEWER",
    department: "Internal Audit",
    status: "ACTIVE",
  },
  {
    userId: "U020",
    name: "Charlie Allen",
    username: "charlie.allen",
    email: "charlie.allen@reconciliation.com",
    role: "REVIEWER",
    department: "Finance Management",
    status: "ACTIVE",
  },
];

// ============================================
// CREATE USERS
// ============================================

const createUsers = async () => {
  try {
    await connectDatabase();

    const database = getDatabase();
    const usersCollection = database.collection("users");

    // ----------------------------------------
    // Create unique indexes
    // ----------------------------------------

    await usersCollection.createIndex(
      { userId: 1 },
      { unique: true }
    );

    await usersCollection.createIndex(
      { username: 1 },
      { unique: true }
    );

    await usersCollection.createIndex(
      { email: 1 },
      { unique: true }
    );

    // ----------------------------------------
    // Temporary password
    // ----------------------------------------

    const temporaryPassword = "Temp@12345";

    // Hash once because every initial user
    // uses the same development password.
    const hashedPassword = await bcrypt.hash(
      temporaryPassword,
      12
    );

    // ----------------------------------------
    // Create each user
    // ----------------------------------------

    for (const user of users) {
      const existingUser =
        await usersCollection.findOne({
          userId: user.userId,
        });

      if (existingUser) {
        console.log(
          `${user.userId} - ${user.name} already exists.`
        );

        continue;
      }

      await usersCollection.insertOne({
        ...user,

        password: hashedPassword,

        mustChangePassword: true,

        lastLogin: null,

        passwordChangedAt: null,

        createdAt: new Date(),

        updatedAt: new Date(),
      });

      console.log(
        `Created ${user.userId} - ${user.name} (${user.role})`
      );
    }

    console.log("");
    console.log("======================================");
    console.log("Initial users created successfully.");
    console.log("======================================");
    console.log(`Total users: ${users.length}`);
    console.log("Admins: 3");
    console.log("Preparers: 12");
    console.log("Reviewers: 5");
    console.log("");
    console.log(
      "Development temporary password: Temp@12345"
    );
    console.log(
      "Users must change this password after first login."
    );
  } catch (error) {
    console.error("Failed to create users:");
    console.error(error);
  } finally {
    await closeDatabase();
  }
};

createUsers();