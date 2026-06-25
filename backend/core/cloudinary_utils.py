import cloudinary.uploader


def upload_file(file, folder='nexus'):
    """Upload a file to Cloudinary and return the secure URL."""
    result = cloudinary.uploader.upload(
        file,
        folder=folder,
        resource_type='auto'
    )
    return {
        'url': result.get('secure_url'),
        'public_id': result.get('public_id'),
        'file_size': result.get('bytes'),
    }


def delete_file(public_id):
    """Delete a file from Cloudinary by public_id."""
    cloudinary.uploader.destroy(public_id)
