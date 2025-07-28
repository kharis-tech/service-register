import Airtable from "airtable";

// Initialize Airtable
const base = new Airtable({
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
}).base(import.meta.env.VITE_AIRTABLE_BASE_ID);

// Table references
const membersTable = base("Members");
const eventsTable = base("Services");
const attendanceTable = base("Service Attendance");

// Type for member data
interface MemberData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  soul_type: string;
  evangelism_type: string;
  department: string;
  completed_membership: boolean;
  completed_new_believers: boolean;
  is_baptised: boolean;
  completed_spiritual_maturity: boolean;
  first_attendance_date: string;
  last_attendance_date: string;
  soul_winner: string;
  address: string;
  point_of_contact: string;
  [key: string]: unknown;
}

// Type for event data
interface EventData {
  type: string;
  date: string;
  location: string;
  [key: string]: unknown;
}

// Member operations
export const getMembers = async (options?: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  eventId?: string;
}) => {
  const { page = 1, pageSize = 100, searchTerm = '', eventId } = options || {};
  
  let filterFormula = '';
  
  // Add search filter if provided
  if (searchTerm) {
    filterFormula = `OR(
      SEARCH("${searchTerm.toLowerCase()}", LOWER({first_name})),
      SEARCH("${searchTerm.toLowerCase()}", LOWER({last_name}))
    )`;
  }
  
  // If we have an eventId, we can optimize by only fetching members who have attended this event
  // This is a significant optimization for the EventAttendance page
  if (eventId) {
    const attendanceRecords = await attendanceTable
      .select({
        filterByFormula: `{event_id} = '${eventId}'`,
      })
      .all();
      
    const memberIds = attendanceRecords
      .map(record => {
        const memberField = record.fields.Member;
        if (memberField && Array.isArray(memberField) && memberField.length > 0) {
          return memberField[0] as string;
        }
        return '';
      })
      .filter(id => id !== '');
      
    if (memberIds.length > 0) {
      const memberFilter = `OR(${memberIds.map(id => `RECORD_ID() = '${id}'`).join(', ')})`;
      filterFormula = filterFormula
        ? `AND(${filterFormula}, ${memberFilter})`
        : memberFilter;
    }
  }
  
  // Calculate offset based on page and pageSize
  const offset = (page - 1) * pageSize;
  
  // Fetch records with pagination
  const query: any = {
    pageSize,
    offset,
  };
  
  if (filterFormula) {
    query.filterByFormula = filterFormula;
  }
  
  const records = await membersTable.select(query).all();
  
  return {
    data: records.map((record) => ({
      id: record.id,
      ...record.fields,
    })),
    page,
    pageSize,
    hasMore: records.length === pageSize,
  };
};

export const getMember = async (id: string) => {
  const records = await membersTable
    .select({
      filterByFormula: `{id} = '${id}'`,
      maxRecords: 1,
    })
    .all();

  if (records.length === 0) {
    throw new Error(`Member with ID ${id} not found`);
  }

  const record = records[0];
  return {
    id: record.id,
    ...record.fields,
  };
};

export const createMember = async (data: Partial<MemberData>) => {
  const record = await membersTable.create(data);
  return {
    id: record.id,
    ...record.fields,
  };
};

export const updateMember = async (id: string, data: Partial<MemberData>) => {
  const record = await membersTable.update(id, data);
  return {
    id: record.id,
    ...record.fields,
  };
};

// Service Event operations
export const getEvents = async () => {
  const records = await eventsTable.select().all();
  return records.map((record) => ({
    id: record.id,
    ...record.fields,
  }));
};

export const getEvent = async (id: string) => {
  const records = await eventsTable
    .select({
      filterByFormula: `{id} = '${id}'`,
      maxRecords: 1,
    })
    .all();

  if (records.length === 0) {
    throw new Error(`Event with ID ${id} not found`);
  }

  const record = records[0];
  return {
    id: record.id,
    ...record.fields,
  };
};

export const createEvent = async (data: Partial<EventData>) => {
  const record = await eventsTable.create(data);
  return {
    id: record.id,
    ...record.fields,
  };
};

// Attendance operations
export const getAttendance = async (eventId: string) => {
  const records = await attendanceTable
    .select({
      filterByFormula: `{event_id} = '${eventId}'`,
    })
    .all();

  return records.map((record) => ({
    id: record.id,
    ...record.fields,
  }));
};

export const markAttendance = async (memberId: string, eventId: string) => {
  const record = await attendanceTable.create({
    Member: [memberId],
    "Service Event": [eventId],
    Status: true,
    Timestamp: new Date().toISOString(),
  });

  return {
    id: record.id,
    ...record.fields,
  };
};

// Reports operations
export const getLapsedAttendees = async (
  presentEventId: string,
  absentEventId: string
) => {
  // First get all attendees from the present event
  const presentAttendees = await attendanceTable
    .select({
      filterByFormula: `AND({event_id} = '${presentEventId}', {status} = TRUE())`,
    })
    .all();

  const presentMemberIds = presentAttendees
    .map((record) => {
      const memberField = record.fields.Member;
      if (memberField && Array.isArray(memberField) && memberField.length > 0) {
        return memberField[0] as string;
      }
      return "";
    })
    .filter((id) => id !== "");

  // Then get all attendees from the absent event
  const absentAttendees = await attendanceTable
    .select({
      filterByFormula: `AND({event_id} = '${absentEventId}', {status} = TRUE())`,
    })
    .all();

  const absentMemberIds = absentAttendees
    .map((record) => {
      const memberField = record.fields.Member;
      if (memberField && Array.isArray(memberField) && memberField.length > 0) {
        return memberField[0] as string;
      }
      return "";
    })
    .filter((id) => id !== "");

  // Find members who were present at the first event but absent at the second
  const lapsedMemberIds = presentMemberIds.filter(
    (id) => !absentMemberIds.includes(id)
  );

  // Get the details of these members
  const lapsedMembers = [];
  if (lapsedMemberIds.length > 0) {
    // Get all lapsed members in a single query
    const formula = `OR(${lapsedMemberIds
      .map((id) => `{id} = '${id}'`)
      .join(", ")})`;
    const records = await membersTable
      .select({
        filterByFormula: formula,
      })
      .all();

    for (const record of records) {
      lapsedMembers.push({
        id: record.id,
        ...record.fields,
      });
    }
  }

  return lapsedMembers;
};
