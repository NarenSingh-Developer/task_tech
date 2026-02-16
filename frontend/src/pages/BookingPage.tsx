import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { format } from 'date-fns';
import { Calendar, Clock, User, Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const GET_BOOKING_LINK = gql`
  query GetBookingLink($slug: String!) {
    bookingLink(slug: $slug) {
      id
      user {
        name
      }
    }
  }
`;

const GET_AVAILABLE_SLOTS = gql`
  query GetAvailableSlots($slug: String!, $date: String!) {
    availableSlots(slug: $slug, date: $date) {
      startTime
      endTime
      isAvailable
    }
  }
`;

const BOOK_SLOT = gql`
  mutation BookSlot($bookSlotInput: BookSlotInput!) {
    bookSlot(bookSlotInput: $bookSlotInput) {
      id
      date
      startTime
      visitorName
    }
  }
`;

export default function BookingPage() {
    const { slug } = useParams<{ slug: string }>();
    const [date, setDate] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [visitorName, setVisitorName] = useState('');
    const [visitorEmail, setVisitorEmail] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const { data: linkData, loading: linkLoading, error: linkError } = useQuery(GET_BOOKING_LINK, {
        variables: { slug },
        skip: !slug,
    });

    const { data: slotsData, loading: slotsLoading } = useQuery(GET_AVAILABLE_SLOTS, {
        variables: { slug, date },
        skip: !slug || !date,
    });

    const [bookSlot, { loading: bookingLoading, error: bookingError }] = useMutation(BOOK_SLOT, {
        onCompleted: () => setBookingSuccess(true),
    });

    const handleBook = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !slug) return;

        bookSlot({
            variables: {
                bookSlotInput: {
                    slug,
                    date,
                    startTime: selectedSlot,
                    visitorName,
                    visitorEmail,
                },
            },
        });
    };

    if (linkLoading) return <div className="flex justify-center items-center min-h-screen text-slate-500"><Loader2 className="animate-spin mr-2" /> Loading...</div>;
    if (linkError) return <div className="flex justify-center items-center min-h-screen text-red-500"><AlertCircle className="mr-2" /> Invalid Booking Link</div>;
    if (bookingSuccess) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl text-center border border-green-100">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                <p className="text-slate-500 mb-6">You are scheduled with {linkData?.bookingLink?.user?.name}.</p>
                <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left space-y-2 text-sm border border-slate-100">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Date</span>
                        <span className="font-medium">{date}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Time</span>
                        <span className="font-medium">{selectedSlot}</span>
                    </div>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                    Book Another
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 min-h-[600px] flex md:flex-row flex-col">
            {/* Sidebar Info */}
            <div className="md:w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-between">
                <div>
                    <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1 mr-1">Scheduling with</div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">{linkData?.bookingLink?.user?.name}</h1>

                    <div className="space-y-4 text-slate-600">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-3 text-slate-400" />
                            <span>30 min</span>
                        </div>
                        {date && (
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-3 text-slate-400" />
                                <span>{format(new Date(date), 'EEEE, MMMM do, yyyy')}</span>
                            </div>
                        )}
                        {selectedSlot && (
                            <div className="flex items-center font-medium text-blue-600">
                                <CheckCircle className="h-5 w-5 mr-3" />
                                <span>{selectedSlot}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-8 md:mt-0 text-xs text-slate-400">
                    Powered by SchedulerApp
                </div>
            </div>

            {/* Main Content */}
            <div className="md:w-2/3 p-8">
                {!date ? (
                    <div className="h-full flex flex-col justify-center">
                        <h2 className="text-xl font-semibold mb-6 text-slate-800">Select a Date</h2>
                        <input
                            type="date"
                            className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setDate(e.target.value)}
                        />
                        <div className="mt-8 text-center text-slate-400 text-sm">
                            Choose a date to see available time slots
                        </div>
                    </div>
                ) : !selectedSlot ? (
                    <div>
                        <button
                            onClick={() => setDate('')}
                            className="mb-6 text-sm text-slate-500 hover:text-slate-800 flex items-center transition-colors"
                        >
                            ← Back to calendar
                        </button>
                        <h2 className="text-xl font-semibold mb-6 text-slate-800">Select a Time</h2>
                        {slotsLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400 h-8 w-8" /></div>
                        ) : slotsData?.availableSlots?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {slotsData.availableSlots.map((slot: any) => (
                                    <button
                                        key={slot.startTime}
                                        onClick={() => setSelectedSlot(slot.startTime)}
                                        className="py-3 px-4 rounded-lg border border-blue-100 text-blue-600 font-medium hover:bg-blue-50 hover:border-blue-300 transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                    >
                                        {slot.startTime}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                No slots available for this date.
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setSelectedSlot(null)}
                            className="mb-6 text-sm text-slate-500 hover:text-slate-800 flex items-center transition-colors"
                        >
                            ← Back to times
                        </button>
                        <h2 className="text-xl font-semibold mb-6 text-slate-800">Enter Details</h2>
                        <form onSubmit={handleBook} className="space-y-4 max-w-md">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={visitorName}
                                        onChange={(e) => setVisitorName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={visitorEmail}
                                        onChange={(e) => setVisitorEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {bookingError && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    {bookingError.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex justify-center items-center"
                            >
                                {bookingLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
