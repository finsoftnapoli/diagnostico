-- Bilancio anche in formato XBRL (il file depositato al Registro Imprese): l'archivio privato accetta file XML.
update storage.buckets
set allowed_mime_types = array['application/pdf', 'application/xml']
where id = 'documenti';
