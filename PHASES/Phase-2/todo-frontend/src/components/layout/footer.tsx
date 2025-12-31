export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground font-body">
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
