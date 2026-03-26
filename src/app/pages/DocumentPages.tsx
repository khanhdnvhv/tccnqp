import { DocumentListEnhanced } from './DocumentList';

export function IncomingPage() {
  return <DocumentListEnhanced title="Văn bản đến" type="incoming" />;
}

export function OutgoingPage() {
  return <DocumentListEnhanced title="Văn bản đi" type="outgoing" />;
}

export function InternalPage() {
  return <DocumentListEnhanced title="Văn bản nội bộ" type="internal" />;
}
