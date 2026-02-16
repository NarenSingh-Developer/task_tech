import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Link, Check, Copy, Plus, Loader2, Calendar } from 'lucide-react';

const GENERATE_BOOKING_LINK = gql`
  mutation GenerateBookingLink {
    generateBookingLink {
      id
      slug
      isActive
    }
  }
`;

const GET_MY_BOOKING_LINKS = gql`
  query GetMyBookingLinks {
    myBookingLinks {
      id
      slug
      isActive
      createdAt
    }
  }
`;

const CREATE_AVAILABILITY = gql`
  mutation CreateAvailability($date: String!, $startTime: String!, $endTime: String!) {
    createAvailability(createAvailabilityInput: { date: $date, startTime: $startTime, endTime: $endTime }) {
      id
      date
      startTime
      endTime
    }
  }
`;

export default function OwnerDashboard() {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [availabilityList, setAvailabilityList] = useState<any[]>([]);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    const { data: linksData, refetch: refetchLinks } = useQuery(GET_MY_BOOKING_LINKS);

    const [generateLink, { loading: linkLoading }] = useMutation(GENERATE_BOOKING_LINK, {
        onCompleted: () => refetchLinks(),
    });

    const [createAvailability, { loading: availabilityLoading, error: availabilityError }] = useMutation(CREATE_AVAILABILITY, {
        onCompleted: (data: any) => {
            setAvailabilityList((prev) => [...prev, data.createAvailability]);
            setDate('');
            setStartTime('');
            setEndTime('');
        },
    });

    const handleCreateAvailability = (e: React.FormEvent) => {
        e.preventDefault();
        createAvailability({ variables: { date, startTime, endTime } });
    };

    const copyLink = (slug: string) => {
        const url = `${window.location.origin}/book/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">Owner Dashboard</h1>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
                >
                    Logout
                </button>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Availability Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-slate-800">Manage Availability</h2>
                    </div>

                    <form onSubmit={handleCreateAvailability} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 focus:ring-blue-500 focus:border-blue-500 px-3 py-2 border"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {availabilityError && (
                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{availabilityError.message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={availabilityLoading}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {availabilityLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Add Availability'}
                        </button>
                    </form>

                    {availabilityList.length > 0 && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">Recently Added</h3>
                            <ul className="space-y-2">
                                {availabilityList.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg">
                                        <span className="font-medium text-slate-700">{item.date}</span>
                                        <span className="text-slate-500 font-mono">{item.startTime} - {item.endTime}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-slate-400 mt-2 italic">* List clears on refresh</p>
                        </div>
                    )}
                </section>

                {/* Booking Links Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Link className="h-5 w-5 text-purple-600" />
                            <h2 className="text-xl font-semibold text-slate-800">Booking Links</h2>
                        </div>
                        <button
                            onClick={() => generateLink()}
                            disabled={linkLoading}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                            {linkLoading ? <Loader2 className="animate-spin h-3 w-3" /> : <Plus className="h-3 w-3 mr-1" />}
                            Generate New
                        </button>
                    </div>

                    <div className="space-y-3">
                        {linksData?.myBookingLinks.map((link: any) => (
                            <div key={link.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 group hover:border-purple-200 transition-colors">
                                <div className="truncate flex-1 mr-4">
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {window.location.origin}/book/{link.slug}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Created {new Date(link.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => copyLink(link.slug)}
                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all"
                                    title="Copy Link"
                                >
                                    {copiedSlug === link.slug ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        ))}
                        {linksData?.myBookingLinks.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No booking links generated yet.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
