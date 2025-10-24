interface props {
    providerId: string;
}

export default function CatalogComponent({ providerId }: props) {
    return (
        <div>
            <h1>Catalog Component for Provider ID: {providerId}</h1>
        </div>
    );
}