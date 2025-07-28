import * as airtableApi from './airtableApi';

interface ReportParams {
  present_event_id: string;
  absent_event_id: string;
}

interface ApiConfig {
  params?: ReportParams | Record<string, string> | {
    page?: string;
    pageSize?: string;
    searchTerm?: string;
    eventId?: string;
  };
}

// Define a generic type for the API response
interface ApiResponse<T> {
  data: T;
}

export default {
  get: async <T>(endpoint: string, config: ApiConfig = {}): Promise<ApiResponse<T>> => {
    if (endpoint.startsWith('/members')) {
      if (endpoint === '/members') {
        // Extract pagination and search parameters if provided
        const params = config.params || {};
        // @ts-ignore - TypeScript doesn't understand the structure of params
        const options = {
          page: parseInt(params.page || '1'),
          pageSize: parseInt(params.pageSize || '100'),
          searchTerm: params.searchTerm || '',
          eventId: params.eventId
        };
        return { data: await airtableApi.getMembers(options) as unknown as T };
      } else {
        const id = endpoint.split('/')[2];
        return { data: await airtableApi.getMember(id) as unknown as T };
      }
    } else if (endpoint.startsWith('/service-events')) {
      if (endpoint === '/service-events') {
        return { data: await airtableApi.getEvents() as unknown as T };
      } else {
        const id = endpoint.split('/')[2];
        return { data: await airtableApi.getEvent(id) as unknown as T };
      }
    } else if (endpoint.startsWith('/attendance')) {
      const eventId = endpoint.split('/')[2];
      return { data: await airtableApi.getAttendance(eventId) as unknown as T };
    } else if (endpoint.startsWith('/reports/lapsed-attendees')) {
      const params = config.params as ReportParams;
      return { data: await airtableApi.getLapsedAttendees(params.present_event_id, params.absent_event_id) as unknown as T };
    }
    throw new Error(`Endpoint not supported: ${endpoint}`);
  },
  
  post: async <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    if (endpoint.startsWith('/members')) {
      return { data: await airtableApi.createMember(data) as unknown as T };
    } else if (endpoint.startsWith('/service-events')) {
      return { data: await airtableApi.createEvent(data) as unknown as T };
    } else if (endpoint.startsWith('/attendance')) {
      const params = new URLSearchParams(endpoint.split('?')[1]);
      const memberId = params.get('user_id') || '';
      const eventId = params.get('event_id') || '';
      return { data: await airtableApi.markAttendance(memberId, eventId) as unknown as T };
    }
    throw new Error(`Endpoint not supported: ${endpoint}`);
  },
  
  put: async <T>(endpoint: string, data: any): Promise<ApiResponse<T>> => {
    if (endpoint.startsWith('/members')) {
      const id = endpoint.split('/')[2];
      return { data: await airtableApi.updateMember(id, data) as unknown as T };
    }
    throw new Error(`Endpoint not supported: ${endpoint}`);
  }
};
